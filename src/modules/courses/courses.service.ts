import { CourseRepository } from './../../prisma/repositories/course.repository';
import { ProfessorRepository } from 'src/prisma/repositories/professor.repository';
import { Injectable } from '@nestjs/common';
import { apply_order } from 'src/common/utils/search.utils';
import { courseSelectResultType, departmentSelectResultType, lectureSelectResultType, professorSelectResultType } from 'src/common/schemaTypes/types';
import { CourseProfessorDto } from 'src/common/interfaces/dto/course/course.professor.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { session_userprofile, subject_course } from '@prisma/client';


@Injectable()
export class CoursesService {
  constructor(
    private readonly CourseRepository: CourseRepository,
    private readonly ProfessorRepository: ProfessorRepository,
  ) {}

  public async getCourseByFilter(query: any, user: session_userprofile) {
    const query_result = await this.CourseRepository.filterByRequest(query);
    return await this.to_json(query_result, user);
  }

  private async to_json(query_res: subject_course[], user: session_userprofile, nested=false) {
    return Promise.all(query_res.map(async (course) => {
      const representative_lecture = await this.get_representative_lecture(course.lecture);
      const professor_raw = await Promise.all(course.subject_course_professors.map(async (x) => {
        const professor_id = x.professor_id;
        return await this.ProfessorRepository.getProfessorById(professor_id);
      }));
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

  private async get_representative_lecture(lectures: lectureSelectResultType[]): Promise<lectureSelectResultType> {
    const ordered_lectures = await apply_order<lectureSelectResultType>(lectures, ["year", "semester"])
    return ordered_lectures[0];
  }

  private async to_json_professor(professors: professorSelectResultType[], nested=false) {
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
  private to_json_department(department: departmentSelectResultType, nested=false) {
    return {
      "id": department.id,
      "name": department.name,
      "name_en": department.name_en,
      "code": department.code,
    }
  }
}