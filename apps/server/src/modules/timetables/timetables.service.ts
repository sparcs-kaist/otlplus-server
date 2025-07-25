import {
  BadRequestException, HttpException, HttpStatus, Inject, Injectable,
} from '@nestjs/common'
import { Transactional } from '@nestjs-cls/transactional'
import { ITimetable } from '@otl/server-nest/common/interfaces'
import { TIMETABLE_MQ, TimetableMQ } from '@otl/server-nest/modules/timetables/domain/out/TimetableMQ'
import { session_userprofile } from '@prisma/client'

import logger from '@otl/common/logger/logger'

import { LectureRepository, SemesterRepository, TimetableRepository } from '@otl/prisma-client'
import { orderFilter } from '@otl/prisma-client/common/util'
import { ELecture } from '@otl/prisma-client/entities/ELecture'
import { ETimetable } from '@otl/prisma-client/entities/ETimetable'

@Injectable()
export class TimetablesService {
  constructor(
    private readonly timetableRepository: TimetableRepository,
    private readonly lectureRepository: LectureRepository,
    private readonly semesterRepository: SemesterRepository,
    @Inject(TIMETABLE_MQ)
    private readonly timetableMQ: TimetableMQ,
  ) {}

  async getTimetables(query: ITimetable.QueryDto, user: session_userprofile) {
    const {
      year, semester, order, offset, limit,
    } = query

    const orderBy = orderFilter(order)
    const paginationAndSorting = {
      skip: offset,
      take: limit,
      orderBy,
    }

    const timetables = await this.timetableRepository.getTimetables(user, year, semester, paginationAndSorting)
    return timetables
  }

  async getTimetable(timetableId: number) {
    return await this.timetableRepository.getTimeTableById(timetableId)
  }

  async validateYearAndSemester(year: number, semester: number) {
    const existsSemester: boolean = await this.semesterRepository.existsSemester(year, semester)
    return existsSemester || (year > 2009 && year < 2018 && semester && [1, 3].includes(semester))
  }

  @Transactional()
  async createTimetable(timeTableBody: ITimetable.CreateDto, user: session_userprofile) {
    const { year, semester } = timeTableBody
    if (!(await this.validateYearAndSemester(year, semester))) {
      throw new BadRequestException('Wrong fields \'year\' and \'semester\' in request data')
    }

    let arrangeOrder = 0
    const relatedTimeTables = await this.timetableRepository.getTimetableBasics(user, year, semester, {
      orderBy: { arrange_order: 'asc' },
    })
    if (relatedTimeTables.length > 0) {
      arrangeOrder = relatedTimeTables[relatedTimeTables.length - 1].arrange_order + 1
    }

    /*
    기존 파이썬 코드는 lectureId list가 오면 냅다 검색해서 timetable에 붙이고 return 해버렸으나,
    timetable이 속한 semester, year와 lecture들의 semester, year를 비교해서 일치하는 것만 붙이는 것으로 변경

    또한 lectureId 중 데이터베이스에 존재하지 않는 것이 하나라도 있으면, 바로 에러를 내버리는 식으로 구현되었으나,
    가능한 것들은 모두 붙여서 저장하는 것으로 변경.
    */
    const lectureIds = timeTableBody.lectures
    const lectures = await this.lectureRepository.getLectureByIds(lectureIds)
    const filteredLectures = lectures.filter(
      (lecture) => lecture.semester === timeTableBody.semester && lecture.year === timeTableBody.year,
    )
    const result = await this.timetableRepository.createTimetable(user, year, semester, arrangeOrder, filteredLectures)
    await Promise.all(lectures.map((lecture) => this.timetableMQ.publishLectureNumUpdate(lecture.id))).catch(
      (error) => {
        logger.error('Failed to publish lecture num update', error)
      },
    )
    return result
  }

  @Transactional()
  async addLectureToTimetable(timeTableId: number, body: ITimetable.AddLectureDto) {
    const lectureId = body.lecture
    const lecture = await this.lectureRepository.getLectureBasicById(lectureId)
    const timetable = await this.timetableRepository.getTimeTableBasicById(timeTableId)
    if (!lecture) {
      throw new BadRequestException('Wrong field \\\'lecture\\\' in request data')
    }
    if (!(lecture.year === timetable.year && lecture.semester === timetable.semester)) {
      throw new BadRequestException('Wrong field \\\'lecture\\\' in request data')
    }
    await this.timetableRepository.addLectureToTimetable(timeTableId, lectureId)
    await this.timetableMQ.publishLectureNumUpdate(lectureId).catch((error) => {
      logger.error('Failed to publish lecture num update', error)
    })
    return await this.timetableRepository.getTimeTableById(timeTableId)
  }

  @Transactional()
  async removeLectureFromTimetable(timeTableId: number, body: ITimetable.AddLectureDto) {
    const lectureId = body.lecture
    const lecture = await this.lectureRepository.getLectureBasicById(lectureId)
    const timetable = await this.timetableRepository.getTimeTableBasicById(timeTableId)
    if (!lecture) {
      throw new BadRequestException('Wrong field \\\'lecture\\\' in request data')
    }
    if (!(lecture.year === timetable.year && lecture.semester === timetable.semester)) {
      throw new BadRequestException('Wrong field \\\'lecture\\\' in request data')
    }
    await this.timetableRepository.removeLectureFromTimetable(timeTableId, lectureId)
    await this.timetableMQ.publishLectureNumUpdate(lectureId).catch((error) => {
      logger.error('Failed to publish lecture num update', error)
    })
    return await this.timetableRepository.getTimeTableById(timeTableId)
  }

  @Transactional()
  async deleteTimetable(user: session_userprofile, timetableId: number): Promise<ETimetable.Basic[]> {
    const { semester, year, arrange_order } = await this.timetableRepository.getTimeTableById(timetableId)
    const lectureIds = await this.timetableRepository.getTimeTableLectures(timetableId)
    await this.timetableRepository.deleteById(timetableId)
    const relatedTimeTables = await this.timetableRepository.getTimetables(user, year, semester)
    const timeTablesToBeUpdated = relatedTimeTables
      .filter((timeTable) => timeTable.arrange_order > arrange_order)
      .map((timeTable) => ({
        id: timeTable.id,
        arrange_order: timeTable.arrange_order - 1,
      }))
    const result = await Promise.all(
      timeTablesToBeUpdated.map(async (updateElem) => this.timetableRepository.updateOrder(updateElem.id, updateElem.arrange_order)),
    )
    await Promise.all(lectureIds.map((lectureId) => this.timetableMQ.publishLectureNumUpdate(lectureId))).catch(
      (error) => {
        logger.error('Failed to publish lecture num update', error)
      },
    )
    return result
  }

  @Transactional()
  async reorderTimetable(user: session_userprofile, timetableId: number, body: ITimetable.ReorderTimetableDto) {
    const { arrange_order: targetArrangeOrder } = body
    const targetTimetable = await this.timetableRepository.getTimeTableById(timetableId)
    if (targetTimetable.user_id !== user.id) {
      throw new BadRequestException('User is not owner of timetable')
    }
    if (targetArrangeOrder === targetTimetable.arrange_order) {
      return targetTimetable
    }

    const relatedTimeTables = await this.timetableRepository.getTimetables(
      user,
      targetTimetable.year,
      targetTimetable.semester,
    )
    if (targetArrangeOrder < 0 || targetArrangeOrder >= relatedTimeTables.length) {
      throw new BadRequestException('Wrong field arrange_order in request')
    }

    let timeTablesToBeUpdated: { id: number, arrange_order: number }[] = []
    if (targetArrangeOrder < targetTimetable.arrange_order) {
      timeTablesToBeUpdated = relatedTimeTables
        .filter(
          (timeTable) => timeTable.arrange_order >= targetArrangeOrder && timeTable.arrange_order < targetTimetable.arrange_order,
        )
        .map((timeTable) => ({
          id: timeTable.id,
          arrange_order: timeTable.arrange_order + 1,
        }))
    }
    else if (targetArrangeOrder > targetTimetable.arrange_order) {
      timeTablesToBeUpdated = relatedTimeTables
        .filter(
          (timeTable) => timeTable.arrange_order <= targetArrangeOrder && timeTable.arrange_order > targetTimetable.arrange_order,
        )
        .map((timeTable) => ({
          id: timeTable.id,
          arrange_order: timeTable.arrange_order - 1,
        }))
    }

    await Promise.all(
      timeTablesToBeUpdated.map(async (timetable) => this.timetableRepository.updateOrder(timetable.id, timetable.arrange_order)),
    )
    const updatedTimeTable = await this.timetableRepository.updateOrder(targetTimetable.id, targetArrangeOrder)
    return updatedTimeTable
  }

  public getTimetableType(lectures: ELecture.WithClasstime[]): '5days' | '7days' {
    return lectures.some((lecture) => lecture.subject_classtime.some((classtime) => classtime.day >= 5))
      ? '7days'
      : '5days'
  }

  // Make sure to adjust other methods that use lectures to match the type
  public async getTimetableEntries(
    timetableId: number,
    year: number,
    semester: number,
    user: session_userprofile,
  ): Promise<ELecture.WithClasstime[]> {
    if (!user) {
      throw new HttpException('User profile is required', HttpStatus.BAD_REQUEST)
    }

    const MY_TIMETABLE_ID = -1

    if (timetableId === MY_TIMETABLE_ID) {
      return await this.lectureRepository.getUserLecturesByYearSemester(user.id, year, semester)
    }
    const timetableDetails = await this.timetableRepository.getLecturesWithClassTimes(timetableId)
    if (!timetableDetails) {
      throw new HttpException('No such timetable', HttpStatus.NOT_FOUND)
    }

    return timetableDetails.map((detail) => detail.subject_lecture)
  }
}
