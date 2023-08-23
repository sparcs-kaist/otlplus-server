import { BadRequestException, Injectable } from "@nestjs/common";
import { TimetableRepository } from "../../prisma/repositories/timetable.repository";
import { session_userprofile } from "@prisma/client";
import { TimetableCreateDto, TimetableQueryDto } from "../../common/interfaces/dto/timetable/timetable.request.dto";
import { orderFilter, validateYearAndSemester } from "../../common/utils/search.utils";
import { SemesterRepository } from "../../prisma/repositories/semester.repository";
import { LectureRepository } from "../../prisma/repositories/lecture.repository";

@Injectable()
export class TimetablesService {
  constructor(
    private readonly timetableRepository: TimetableRepository,
    private readonly lectureRepository: LectureRepository,
    private readonly semesterRepository: SemesterRepository
  ) {
  }

  async getTimetables(query: TimetableQueryDto, user: session_userprofile) {
    const { year, semester, order, offset, limit } = query;

    const orderBy = orderFilter(order);
    const paginationAndSorting = {
      skip: offset,
      take: limit,
      orderBy: orderBy
    };

    const timetables = await this.timetableRepository.getTimetables(user, year, semester, paginationAndSorting);
    return timetables;
  }

  async createTimetable(timeTableBody: TimetableCreateDto, user: session_userprofile) {
    const { year, semester } = timeTableBody;
    if (!await validateYearAndSemester(year, semester, this.semesterRepository)) {
      throw new BadRequestException("Wrong fields 'year' and 'semester' in request data");
    }

    let arrangeOrder = 0;
    const relatedTimeTables = await this.timetableRepository.getTimetableBasics(user, year, semester, { orderBy: { arrange_order: "asc" } });
    if (relatedTimeTables.length > 0) {
      arrangeOrder = relatedTimeTables[relatedTimeTables.length - 1].arrange_order + 1;
    }

    /*
    기존 파이썬 코드는 lectureId list가 오면 냅다 검색해서 timetable에 붙이고 return 해버렸으나,
    timetable이 속한 semester, year와 lecture들의 semester, year를 비교해서 일치하는 것만 붙이는 것으로 변경

    또한 lectureId 중 데이터베이스에 존재하지 않는 것이 하나라도 있으면, 바로 에러를 내버리는 식으로 구현되었으나,
    가능한 것들은 모두 붙여서 저장하는 것으로 변경.
    */
    const lectureIds = timeTableBody.lectures;
    const lectures = await this.lectureRepository.getLectureByIds(lectureIds);
    const filteredLectures = lectures.filter((lecture) =>
      lecture.semester === timeTableBody.semester && lecture.year === timeTableBody.year
    );
    return await this.timetableRepository.createTimetable(user, year, semester, arrangeOrder, filteredLectures);
  }
}
