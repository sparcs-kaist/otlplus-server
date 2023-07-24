import { DepartmentRepository } from './../../prisma/repositories/department.repository';
import { CourseRepository } from './../../prisma/repositories/course.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ProfessorResponseDto } from 'src/common/interfaces/dto/professor/professor.response.dto';
import { applyOrder } from 'src/common/utils/search.utils';
import { session_userprofile } from '@prisma/client';
import { subject_course } from 'src/prisma/generated/prisma-class/subject_course';
import { subject_lecture } from 'src/prisma/generated/prisma-class/subject_lecture';
import { subject_department } from 'src/prisma/generated/prisma-class/subject_department';
import { toJsonDepartment } from "../../common/interfaces/serializer/department.serializer";
import { toJsonProfessor } from "../../common/interfaces/serializer/professor.serializer";
import { toJsonCourse } from "../../common/interfaces/serializer/course.serializer";
import { subject_professor } from "../../prisma/generated/prisma-class/subject_professor";
import { getRepresentativeLecture } from "../../common/utils/lecture.utils";
import { CourseResponseDtoNested } from "../../common/interfaces/dto/course/course.response.dto";
import { toJsonLecture } from 'src/common/interfaces/serializer/lecture.serializer';


@Injectable()
export class CoursesService {
  constructor(
    private readonly CourseRepository: CourseRepository,
  ) {}

  public async getCourseByFilter(query: any, user: session_userprofile):  Promise<(CourseResponseDtoNested & { userspecific_is_read: boolean })[]> {
    const queryResult = await this.CourseRepository.filterByRequest(query);
    return queryResult.map((course) => {
      const representativeLecture = getRepresentativeLecture(course.lecture);
      const professorRaw = course.subject_course_professors.map((x) => x.professor as subject_professor);
      const result = toJsonCourse(course, representativeLecture, professorRaw, false);

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

  public async getCourseById(id: number, user: session_userprofile) {
    const course = await this.CourseRepository.getCourseById(id);
    if (!course) {
      throw new NotFoundException();
    }
    const representativeLecture = getRepresentativeLecture(course.lecture);
    const professorRaw = course.subject_course_professors.map((x) => x.professor as subject_professor);
    const result = toJsonCourse(course, representativeLecture, professorRaw, false);

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
  }

  public async getLecturesByCourseId(query: {order: string}, id: number, user: session_userprofile) {
    const lectures = await this.CourseRepository.getLecturesByCourseId(query, id);
    if (!lectures) {
      throw new NotFoundException();
    }

    return lectures.map((lecture) => toJsonLecture(lecture));
  }
}