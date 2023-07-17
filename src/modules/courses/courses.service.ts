import { CourseRepository } from './../../prisma/repositories/course.repository';
import { Injectable } from '@nestjs/common';
import { apply_order } from 'src/common/utils/search.utils';
import { courseSelectResultType, lectureSelectResultType } from 'src/common/schemaTypes/types';

@Injectable()
export class CoursesService {
  constructor(
    private readonly CourseRepository: CourseRepository,
  ) {}

  public async getCourseByFilter(query: any) {
    const query_result = await this.CourseRepository.filterByRequest(query);
    return this.to_json(query_result);
  }

  private to_json(query_res: courseSelectResultType[], nested: boolean = false, user = null) {
    return {
      "id": query_res.map((x) => x.id),
      "old_code": query_res.map((x) => x.old_code),
      "department": query_res.map((x) => x.subject_department),
      "type": query_res.map((x) => x.type),
      "type_en": query_res.map((x) => x.type_en),
      "title": query_res.map((x) => x.title),
      "title_en": query_res.map((x) => x.title_en),
      "summary": query_res.map((x) => x.summury), // Todo: fix summury typo in db.
      "review_total_weight": query_res.map((x) => x.review_total_weight),
      "credit": query_res.map((x) => this.get_representative_lecture(x.lecture) ?? 0),
      "credit_au": query_res.map((x) => this.get_representative_lecture(x.lecture) ?? 0),
      "num_classes": query_res.map((x) => this.get_representative_lecture(x.lecture) ?? 0),
      "num_labs": query_res.map((x) => this.get_representative_lecture(x.lecture) ?? 0),
    }
  }

  private get_representative_lecture(lectures: lectureSelectResultType[]): lectureSelectResultType {
    const ordered_lectures = apply_order<lectureSelectResultType>(lectures, ["year", "semester"])
    return ordered_lectures[0];
  }
}