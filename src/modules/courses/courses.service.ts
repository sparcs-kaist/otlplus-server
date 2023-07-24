import { CourseRepository } from "./../../prisma/repositories/course.repository";
import { Injectable } from "@nestjs/common";
import { session_userprofile } from "@prisma/client";
import { toJsonCourse } from "../../common/interfaces/serializer/course.serializer";
import { subject_professor } from "../../prisma/generated/prisma-class/subject_professor";
import { getRepresentativeLecture } from "../../common/utils/lecture.utils";
import { CourseResponseDtoNested } from "../../common/interfaces/dto/course/course.response.dto";


@Injectable()
export class CoursesService {
  constructor(
    private readonly CourseRepository: CourseRepository
  ) {}

  public async getCourseByFilter(query: any, user: session_userprofile):  Promise<(CourseResponseDtoNested & { userspecific_is_read: boolean })[]> {
    const queryResult = await this.CourseRepository.filterByRequest(query);
    return queryResult.map((course) => {

      const representativeLecture = getRepresentativeLecture(course.lecture);
      const professorRaw = course.subject_course_professors.map( (x) => x.professor as subject_professor);
      const result = toJsonCourse(course, representativeLecture, professorRaw,false);

      if (user) {
        const latestReadDatetime = course.subject_courseuser.find(x => x.user_profile_id = user.id)?.latest_read_datetime;
        const latestWrittenDatetime = course.latest_written_datetime;
        return Object.assign(result, {
          "userspecific_is_read": latestWrittenDatetime < latestReadDatetime,
        })
      } else {
        return Object.assign(result, {
          "userspecific_is_read": false,
        })
      }
    })
  }
}