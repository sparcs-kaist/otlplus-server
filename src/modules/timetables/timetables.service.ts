import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import {
  AddLectureDto,
  ReorderTimetableDto,
  TimetableCreateDto,
  TimetableQueryDto,
} from '../../common/interfaces/dto/timetable/timetable.request.dto';
import {
  orderFilter,
  validateYearAndSemester,
} from '../../common/utils/search.utils';
import { PrismaService } from '../../prisma/prisma.service';
import { LectureRepository } from '../../prisma/repositories/lecture.repository';
import { SemesterRepository } from '../../prisma/repositories/semester.repository';
import { TimetableRepository } from '../../prisma/repositories/timetable.repository';
import { ILecture } from 'src/common/interfaces';

@Injectable()
export class TimetablesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly timetableRepository: TimetableRepository,
    private readonly lectureRepository: LectureRepository,
    private readonly semesterRepository: SemesterRepository,
  ) {}

  async getTimetables(query: TimetableQueryDto, user: session_userprofile) {
    const { year, semester, order, offset, limit } = query;

    const orderBy = orderFilter(order);
    const paginationAndSorting = {
      skip: offset,
      take: limit,
      orderBy: orderBy,
    };

    const timetables = await this.timetableRepository.getTimetables(
      user,
      year,
      semester,
      paginationAndSorting,
    );
    return timetables;
  }

  async getTimetable(timetableId: number) {
    return await this.timetableRepository.getTimeTableById(timetableId);
  }

  async createTimetable(
    timeTableBody: TimetableCreateDto,
    user: session_userprofile,
  ) {
    const { year, semester } = timeTableBody;
    if (
      !(await validateYearAndSemester(year, semester, this.semesterRepository))
    ) {
      throw new BadRequestException(
        "Wrong fields 'year' and 'semester' in request data",
      );
    }

    let arrangeOrder = 0;
    const relatedTimeTables = await this.timetableRepository.getTimetableBasics(
      user,
      year,
      semester,
      { orderBy: { arrange_order: 'asc' } },
    );
    if (relatedTimeTables.length > 0) {
      arrangeOrder =
        relatedTimeTables[relatedTimeTables.length - 1].arrange_order + 1;
    }

    /*
    기존 파이썬 코드는 lectureId list가 오면 냅다 검색해서 timetable에 붙이고 return 해버렸으나,
    timetable이 속한 semester, year와 lecture들의 semester, year를 비교해서 일치하는 것만 붙이는 것으로 변경

    또한 lectureId 중 데이터베이스에 존재하지 않는 것이 하나라도 있으면, 바로 에러를 내버리는 식으로 구현되었으나,
    가능한 것들은 모두 붙여서 저장하는 것으로 변경.
    */
    const lectureIds = timeTableBody.lectures;
    const lectures = await this.lectureRepository.getLectureByIds(lectureIds);
    const filteredLectures = lectures.filter(
      (lecture) =>
        lecture.semester === timeTableBody.semester &&
        lecture.year === timeTableBody.year,
    );
    return await this.timetableRepository.createTimetable(
      user,
      year,
      semester,
      arrangeOrder,
      filteredLectures,
    );
  }

  async addLectureToTimetable(timeTableId: number, body: AddLectureDto) {
    const lectureId = body.lecture;
    const lecture = await this.lectureRepository.getLectureBasicById(lectureId);
    const timetable = await this.timetableRepository.getTimeTableBasicById(
      timeTableId,
    );
    if (!lecture) {
      throw new BadRequestException(
        "Wrong field \\'lecture\\' in request data",
      );
    }
    if (
      !(
        lecture.year == timetable.year && lecture.semester == timetable.semester
      )
    ) {
      throw new BadRequestException(
        "Wrong field \\'lecture\\' in request data",
      );
    }
    await this.timetableRepository.addLectureToTimetable(
      timeTableId,
      lectureId,
    );
    return await this.timetableRepository.getTimeTableById(timeTableId);
  }

  async removeLectureFromTimetable(timeTableId: number, body: AddLectureDto) {
    const lectureId = body.lecture;
    const lecture = await this.lectureRepository.getLectureBasicById(lectureId);
    const timetable = await this.timetableRepository.getTimeTableBasicById(
      timeTableId,
    );
    if (!lecture) {
      throw new BadRequestException(
        "Wrong field \\'lecture\\' in request data",
      );
    }
    if (
      !(
        lecture.year == timetable.year && lecture.semester == timetable.semester
      )
    ) {
      throw new BadRequestException(
        "Wrong field \\'lecture\\' in request data",
      );
    }
    await this.timetableRepository.removeLectureFromTimetable(
      timeTableId,
      lectureId,
    );
    return await this.timetableRepository.getTimeTableById(timeTableId);
  }

  async deleteTimetable(user: session_userprofile, timetableId: number) {
    return await this.prismaService.$transaction(async (tx) => {
      const { semester, year, arrange_order } =
        await this.timetableRepository.getTimeTableById(timetableId);
      await this.timetableRepository.deleteById(timetableId);
      const relatedTimeTables = await this.timetableRepository.getTimetables(
        user,
        year,
        semester,
      );
      const timeTablesToBeUpdated = relatedTimeTables
        .filter((timeTable) => timeTable.arrange_order > arrange_order)
        .map((timeTable) => {
          return {
            id: timeTable.id,
            arrange_order: timeTable.arrange_order - 1,
          };
        });
      await Promise.all(
        timeTablesToBeUpdated.map(async (updateElem) => {
          return this.timetableRepository.updateOrder(
            updateElem.id,
            updateElem.arrange_order,
          );
        }),
      );
    });
  }

  async reorderTimetable(
    user: session_userprofile,
    timetableId: number,
    body: ReorderTimetableDto,
  ) {
    return await this.prismaService.$transaction(async (tx) => {
      const { arrange_order: targetArrangeOrder } = body;
      const targetTimetable = await this.timetableRepository.getTimeTableById(
        timetableId,
      );
      if (targetTimetable.user_id !== user.id) {
        throw new BadRequestException('User is not owner of timetable');
      }
      if (targetArrangeOrder === targetTimetable.arrange_order) {
        return targetTimetable;
      }

      const relatedTimeTables = await this.timetableRepository.getTimetables(
        user,
        targetTimetable.year,
        targetTimetable.semester,
      );
      if (
        targetArrangeOrder < 0 ||
        targetArrangeOrder >= relatedTimeTables.length
      ) {
        throw new BadRequestException('Wrong field arrange_order in request');
      }

      let timeTablesToBeUpdated: { id: number; arrange_order: number }[] = [];
      if (targetArrangeOrder < targetTimetable.arrange_order) {
        timeTablesToBeUpdated = relatedTimeTables
          .filter(
            (timeTable) =>
              timeTable.arrange_order >= targetArrangeOrder &&
              timeTable.arrange_order < targetTimetable.arrange_order,
          )
          .map((timeTable) => {
            return {
              id: timeTable.id,
              arrange_order: timeTable.arrange_order + 1,
            };
          });
      } else if (targetArrangeOrder > targetTimetable.arrange_order) {
        timeTablesToBeUpdated = relatedTimeTables
          .filter(
            (timeTable) =>
              timeTable.arrange_order <= targetArrangeOrder &&
              timeTable.arrange_order > targetTimetable.arrange_order,
          )
          .map((timeTable) => {
            return {
              id: timeTable.id,
              arrange_order: timeTable.arrange_order - 1,
            };
          });
      }

      await Promise.all(
        timeTablesToBeUpdated.map(async (timetable) => {
          return this.timetableRepository.updateOrder(
            timetable.id,
            timetable.arrange_order,
          );
        }),
      );
      const updatedTimeTable = await this.timetableRepository.updateOrder(
        targetTimetable.id,
        targetArrangeOrder,
      );
      return updatedTimeTable;
    });
  }

  public getTimetableType(lectures: ILecture.Basic[]): '5days' | '7days' {
    return lectures.some((lecture) =>
      lecture.subject_classtime.some((classtime) => classtime.day >= 5),
    )
      ? '7days'
      : '5days';
  }

  // Make sure to adjust other methods that use lectures to match the type
  public async getTimetableEntries(
    timetableId: number,
  ): Promise<ILecture.Basic[]> {
    const timetableDetails =
      await this.timetableRepository.getLecturesWithClassTimes(timetableId);
    if (!timetableDetails) {
      throw new HttpException('No such timetable', HttpStatus.NOT_FOUND);
    }
    return timetableDetails.map((detail) => detail.subject_lecture);
  }
}
