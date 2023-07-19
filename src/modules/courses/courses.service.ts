import { CourseRepository } from './../../prisma/repositories/course.repository';
import { Injectable } from '@nestjs/common';
import { apply_order } from 'src/common/utils/search.utils';
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
    const query_result = await this.CourseRepository.filterByRequest(query);
    return await this.to_json(query_result, user);
  }

  private async to_json(query_res: subject_course[], user: session_userprofile, nested=false) {
    return Promise.all(query_res.map(async (course) => {
      const representative_lecture = await this.get_representative_lecture(course.lecture);
      const professor_raw = await Promise.all(course.subject_course_professors.map(async (x) => x.professor as subject_professor));
      const professor_json: CourseProfessorDto[] = await this.to_json_professor(professor_raw, true);
      const professor_sorted = await apply_order<CourseProfessorDto>(professor_json, ["name"]);

      let result = {
        "id": course.id,
        "old_code": course.old_code,
        "department": this.to_json_department(course.subject_department, true),
        "type": course.type,
        "type_en": course.type_en,
        "title": course.title,
        "title_en": course.title_en,
        "summary": course.summury, // Todo: fix summury typo in db.
        "review_total_weight": course.review_total_weight,
        "credit": representative_lecture.credit ?? null,
        "credit_au": representative_lecture.credit_au ?? null,
        "num_classes": representative_lecture.num_classes ?? null,
        "num_labs": representative_lecture.num_labs ?? null,
      };

      if (nested) {
        return result;
      }

      result = Object.assign(result, {
        "related_courses_prior": [],
        "related_courses_posterior": [],
        "professors": professor_sorted,
        "grade": course.grade,
        "load": course.load,
        "speech": course.speech,
      })

      if (user) {
        const latest_read_datetime = course.subject_courseuser.find(x => x.user_profile_id = user.id)?.latest_read_datetime;
        const latest_written_datetime = course.latest_written_datetime;
        return Object.assign(result, {
          "userspecific_is_read": latest_written_datetime < latest_read_datetime,
        })
      } else {
        return Object.assign(result, {
          "userspecific_is_read": false,
        })
      }
    }));
  }

  private async get_representative_lecture(lectures: subject_lecture[]): Promise<subject_lecture> {
    const ordered_lectures = await apply_order<subject_lecture>(lectures, ["year", "semester"])
    return ordered_lectures[0];
  }

  private async to_json_professor(professors: subject_professor[], nested=false) {
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
  private to_json_department(department: subject_department, nested=false) {
    return {
      "id": department.id,
      "name": department.name,
      "name_en": department.name_en,
      "code": department.code,
    }
  }
}