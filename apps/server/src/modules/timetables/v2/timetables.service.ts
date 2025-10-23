import {
  BadRequestException, Inject, Injectable, UnauthorizedException,
} from '@nestjs/common'
import { Transactional } from '@nestjs-cls/transactional'
import { ITimetableV2 } from '@otl/server-nest/common/interfaces/v2'
import { TIMETABLE_MQ, TimetableMQ } from '@otl/server-nest/modules/timetables/domain/out/TimetableMQ'
import { Prisma, session_userprofile } from '@prisma/client'

import logger from '@otl/common/logger/logger'

import { TimetableRepository } from '@otl/prisma-client'

@Injectable()
export class TimetablesServiceV2 {
  constructor(
    private readonly timetableRepository: TimetableRepository,
    @Inject(TIMETABLE_MQ)
    private readonly timetableMQ: TimetableMQ,
  ) {}

  async getTimetables(query: ITimetableV2.QueryDto, user: session_userprofile) {
    return await this.timetableRepository.getTimetableBasics(user)
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
          throw new BadRequestException(
            `Invalid arrange_order: must be between 0 and ${relatedTimeTables.length - 1}`,
          )
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
}
