import {
  BadRequestException, ForbiddenException, Inject, Injectable, UnauthorizedException,
} from '@nestjs/common'
import { Transactional } from '@nestjs-cls/transactional'
import { ITimetableV2 } from '@otl/server-nest/common/interfaces/v2'
import { toJsonTimetableV2WithLectures } from '@otl/server-nest/common/serializer/v2/timetable.serializer'
import { TIMETABLE_MQ, TimetableMQ } from '@otl/server-nest/modules/timetables/domain/out/TimetableMQ'
import { Prisma, session_userprofile } from '@prisma/client'

import logger from '@otl/common/logger/logger'

import { LectureRepository, TimetableRepository } from '@otl/prisma-client'

@Injectable()
export class TimetablesServiceV2 {
  constructor(
    private readonly timetableRepository: TimetableRepository,
    private readonly lectureRepository: LectureRepository,
    @Inject(TIMETABLE_MQ)
    private readonly timetableMQ: TimetableMQ,
  ) {}

  async getTimetables(query: ITimetableV2.QueryDto, user: session_userprofile) {
    return await this.timetableRepository.getTimetableBasics(user)
  }

  @Transactional()
  async createTimetable(
    user: session_userprofile,
    body: ITimetableV2.CreateReqDto,
    acceptLanguage?: string,
  ): Promise<ITimetableV2.CreateResDto> {
    const {
      userId, year, semester, lectureIds,
    } = body

    if (userId !== user.id) {
      throw new BadRequestException('Current user does not match userId in POST request')
    }

    const relatedTimetables = await this.timetableRepository.getTimetableBasics(user, year, semester, {
      orderBy: { arrange_order: 'asc' },
    })
    const arrangeOrder = relatedTimetables.length > 0 ? relatedTimetables[relatedTimetables.length - 1].arrange_order + 1 : 0

    // Remove duplicate lecture IDs
    const uniqueLectureIds = Array.from(new Set(lectureIds ?? []))
    const lectures = uniqueLectureIds.length > 0 ? await this.lectureRepository.getLectureByIds(uniqueLectureIds) : []

    // Save only lectures that match the year and semester with timetable
    const filteredLectures = lectures.filter((lecture) => lecture.year === year && lecture.semester === semester)

    const createdTimetable = await this.timetableRepository.createTimetable(
      user,
      year,
      semester,
      arrangeOrder,
      filteredLectures,
    )

    await Promise.all(
      filteredLectures.map(async (lecture) => this.timetableMQ.publishLectureNumUpdate(lecture.id)),
    ).catch((error) => {
      logger.error('Failed to publish lecture num update', error)
    })

    const language = this.parseAcceptLanguage(acceptLanguage)
    return toJsonTimetableV2WithLectures(createdTimetable, language)
  }

  @Transactional()
  async deleteTimetable(
    user: session_userprofile,
    body: ITimetableV2.DeleteReqDto,
  ): Promise<ITimetableV2.DeleteResDto> {
    const { id } = body
    // if timetableId is invalid, throw 400
    if (id === undefined) {
      throw new BadRequestException('Timetable ID is required')
    }

    try {
      const timetable = await this.timetableRepository.getTimeTableById(id)
      // if user is not owner of timetable, throw 401
      if (timetable.user_id !== user.id) {
        throw new UnauthorizedException('Current user does not match owner of requested timetable')
      }

      const { year, semester, arrange_order } = timetable
      const lectureIds = await this.timetableRepository.getTimeTableLectures(id)

      await this.timetableRepository.deleteById(id)

      // update order of other timetables
      const relatedTimeTables = await this.timetableRepository.getTimetables(user, year, semester)
      const timeTablesToBeUpdated = relatedTimeTables
        .filter((timeTable) => timeTable.arrange_order > arrange_order)
        .map((timeTable) => ({
          id: timeTable.id,
          arrange_order: timeTable.arrange_order - 1,
        }))
      await Promise.all(
        timeTablesToBeUpdated.map(async (updateElem) => this.timetableRepository.updateOrder(updateElem.id, updateElem.arrange_order)),
      )

      // update statistics
      await Promise.all(lectureIds.map((lectureId) => this.timetableMQ.publishLectureNumUpdate(lectureId))).catch(
        (error) => {
          logger.error('Failed to publish lecture num update', error)
        },
      )

      return {
        message: 'Timetable deleted successfully',
      }
    }
    catch (error) {
      // catch prisma.timetable_timetable.findUniqueOrThrow() + not found, throw 400
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new BadRequestException('TimetableID is invalid')
        }
      }
      throw error
    }
  }

  // this updates name of timetable or order of timetable
  // at least one of name or order must be provided
  // throw 400 if neither is provided or id is invalid
  // throw 401 if user is unauthorized (if user.id !== timetable.user_id)
  // return 200 if successful, no content
  @Transactional()
  async updateTimetable(
    user: session_userprofile,
    body: ITimetableV2.UpdateReqDto,
  ): Promise<ITimetableV2.UpdateResDto> {
    const { id, name, order } = body
    try {
      if (name === undefined && order === undefined) {
        throw new BadRequestException('At least one of name or order must be provided')
      }

      const timetable = await this.timetableRepository.getTimeTableById(id)
      if (timetable.user_id !== user.id) {
        throw new UnauthorizedException('Current user does not match owner of requested timetable')
      }

      // Handle name update
      if (name !== undefined) {
        await this.timetableRepository.updateName(id, name)
      }

      // Handle order update (complex reordering logic)
      if (order !== undefined) {
        const targetArrangeOrder = order

        // Early return if order hasn't changed
        if (targetArrangeOrder === timetable.arrange_order) {
          return {
            message: 'Timetable updated successfully',
          }
        }

        // Get all related timetables for validation and reordering
        const relatedTimeTables = await this.timetableRepository.getTimetables(user, timetable.year, timetable.semester)

        // Validate order bounds
        if (targetArrangeOrder < 0 || targetArrangeOrder >= relatedTimeTables.length) {
          throw new BadRequestException(`Invalid arrange_order: must be between 0 and ${relatedTimeTables.length - 1}`)
        }

        // Calculate which timetables need to be updated
        let timeTablesToBeUpdated: { id: number, arrange_order: number }[] = []

        if (targetArrangeOrder < timetable.arrange_order) {
          // Moving to earlier position: shift timetables between target and current position forward
          timeTablesToBeUpdated = relatedTimeTables
            .filter(
              (timeTable) => timeTable.arrange_order >= targetArrangeOrder && timeTable.arrange_order < timetable.arrange_order,
            )
            .map((timeTable) => ({
              id: timeTable.id,
              arrange_order: timeTable.arrange_order + 1,
            }))
        }
        else if (targetArrangeOrder > timetable.arrange_order) {
          // Moving to later position: shift timetables between current and target position backward
          timeTablesToBeUpdated = relatedTimeTables
            .filter(
              (timeTable) => timeTable.arrange_order <= targetArrangeOrder && timeTable.arrange_order > timetable.arrange_order,
            )
            .map((timeTable) => ({
              id: timeTable.id,
              arrange_order: timeTable.arrange_order - 1,
            }))
        }

        // Update other timetables first
        await Promise.all(
          timeTablesToBeUpdated.map(async (timetableToUpdate) => this.timetableRepository.updateOrder(timetableToUpdate.id, timetableToUpdate.arrange_order)),
        )

        // Finally update the target timetable
        await this.timetableRepository.updateOrder(id, targetArrangeOrder)
      }

      return {
        message: 'Timetable updated successfully',
      }
    }
    catch (error) {
      // catch prisma.timetable_timetable.findUniqueOrThrow() + not found, throw 400
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new BadRequestException('id of timetable is invalid')
        }
      }
      throw error
    }
  }

  @Transactional()
  async getTimetable(id: number, user: session_userprofile, acceptLanguage?: string): Promise<ITimetableV2.GetResDto> {
    try {
      if (id === undefined) {
        throw new BadRequestException('id of timetable is required')
      }
      const timetable = await this.timetableRepository.getTimeTableById(id)
      if (timetable.user_id !== user.id) {
        throw new UnauthorizedException('Current user does not match owner of requested timetable')
      }

      // Parse Accept-Language header if provided
      const language = this.parseAcceptLanguage(acceptLanguage)
      console.log('language', language)

      return toJsonTimetableV2WithLectures(timetable, language)
    }
    catch (error) {
      // catch prisma.timetable_timetable.findUniqueOrThrow() + not found, throw 400
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new BadRequestException('id of timetable is invalid')
        }
      }
      throw error
    }
  }

  private parseAcceptLanguage(acceptLanguage?: string): string {
    console.log('acceptLanguage', acceptLanguage)
    if (!acceptLanguage) {
      return 'kr' // default language
    }

    // Simple check: if header contains 'en', return 'en', otherwise 'kr'
    return acceptLanguage.toLowerCase().includes('en') ? 'en' : 'kr'
  }

  @Transactional()
  async updateTimetableLecture(
    user: session_userprofile,
    body: ITimetableV2.UpdateLectureReqDto,
    timetableId: number,
  ): Promise<ITimetableV2.UpdateLectureResDto> {
    const { lectureId, action } = body
    try {
      if (lectureId === undefined) {
        throw new BadRequestException('lectureId is required')
      }
      if (action === undefined) {
        throw new BadRequestException('action is required')
      }

      // Fetch lecture first - catch invalid lectureId
      let lecture
      try {
        lecture = await this.lectureRepository.getLectureBasicById(lectureId)
      }
      catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
          throw new BadRequestException('lectureId is invalid')
        }
        throw error
      }

      // Fetch timetable - catch invalid timetableId
      let timetable
      try {
        timetable = await this.timetableRepository.getTimeTableById(timetableId)
      }
      catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
          throw new BadRequestException('timetableId is invalid')
        }
        throw error
      }

      if (lecture.year !== timetable.year || lecture.semester !== timetable.semester) {
        throw new BadRequestException('lecture and timetable are not in the same year and semester')
      }

      // Check access - return 403 if user doesn't own timetable
      if (timetable.user_id !== user.id) {
        throw new ForbiddenException('Current user does not match owner of requested timetable')
      }

      if (action === 'add') {
        await this.timetableRepository.addLectureToTimetable(timetable.id, lectureId)
      }
      else if (action === 'delete') {
        await this.timetableRepository.removeLectureFromTimetable(timetable.id, lectureId)
      }
      await this.timetableMQ.publishLectureNumUpdate(lectureId).catch((error) => {
        logger.error('Failed to publish lecture num update', error)
      })
      return {
        message: 'Timetable lecture updated successfully',
      }
    }
    catch (error) {
      // Re-throw if it's already a HttpException (BadRequestException, ForbiddenException, etc.)
      if (error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error
      }
      // Catch any other Prisma errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new BadRequestException('Either lectureId or timetableId is invalid')
        }
      }
      throw error
    }
  }
}
