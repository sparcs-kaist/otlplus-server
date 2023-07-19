import { CourseRepository } from './../../prisma/repositories/course.repository';
import { Injectable } from '@nestjs/common';
import { applyOrder } from 'src/common/utils/search.utils';
import { CourseProfessorDto } from 'src/common/interfaces/dto/course/course.professor.dto';
import { session_userprofile, subject_professor } from '@prisma/client';
import { subject_course } from 'src/prisma/generated/prisma-class/subject_course';
import { subject_lecture } from 'src/prisma/generated/prisma-class/subject_lecture';
import { subject_department } from 'src/prisma/generated/prisma-class/subject_department';


@Injectable()
export class CoursesService {
  constructor(
    private readonly CourseRepository: CourseRepository,
  ) {}

  public async getCourseByFilter(query: any, user: session_userprofile) {
    const queryResult = await this.CourseRepository.filterByRequest(query);
    return await this.toJson(queryResult, user);
  }

  private async toJson(query_res: subject_course[], user: session_userprofile, nested=false) {
    return Promise.all(query_res.map(async (course) => {
      const representativeLecture = await this.getRepresentativeLecture(course.lecture);
      const professorRaw = await Promise.all(course.subject_course_professors.map(async (x) => x.professor as subject_professor));
      const professorJson: CourseProfessorDto[] = await this.toJsonProfessor(professorRaw, true);
      const professorSorted = await applyOrder<CourseProfessorDto>(professorJson, ["name"]);

      let result = {
        "id": course.id,
        "old_code": course.old_code,
        "department": this.toJsonDepartment(course.subject_department, true),
        "type": course.type,
        "type_en": course.type_en,
        "title": course.title,
        "title_en": course.title_en,
        "summary": course.summury, // Todo: fix summury typo in db.
        "review_total_weight": course.review_total_weight,
        "credit": representativeLecture.credit ?? null,
        "credit_au": representativeLecture.credit_au ?? null,
        "num_classes": representativeLecture.num_classes ?? null,
        "num_labs": representativeLecture.num_labs ?? null,
      };

      if (nested) {
        return result;
      }

      result = Object.assign(result, {
        "related_courses_prior": [],
        "related_courses_posterior": [],
        "professors": professorSorted,
        "grade": course.grade,
        "load": course.load,
        "speech": course.speech,
      })

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
    }));
  }

  private async getRepresentativeLecture(lectures: subject_lecture[]): Promise<subject_lecture> {
    const orderedLectures = await applyOrder<subject_lecture>(lectures, ["year", "semester"])
    return orderedLectures[0];
  }

  private async toJsonProfessor(professors: subject_professor[], nested=false) {
    const result = professors.map((professor) => {
      return {
        "name": professor.professor_name,
        "name_en": professor.professor_name_en,
        "professor_id": professor.professor_id,
        "review_total_weight": professor.review_total_weight,
      }
    });

    if (nested) {
      return result;
    }

    return result.map((professor) => {
      return professor; //todo: add necessary infos
    });
  }
  private toJsonDepartment(department: subject_department, nested=false) {
    return {
      "id": department.id,
      "name": department.name,
      "name_en": department.name_en,
      "code": department.code,
    }
  }
}