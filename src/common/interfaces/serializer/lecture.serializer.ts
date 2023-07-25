import { applyOrder } from "src/common/utils/search.utils";
import { subject_lecture } from "src/prisma/generated/prisma-class/subject_lecture"
import { toJsonClasstime } from "./classtime.serializer";
import { toJsonExamtime } from "./examtime.serializer";
import { LectureResponseDto } from "../dto/lecture/lecture.response.dto";

export const toJsonLecture = (lecture: subject_lecture, nested = false): LectureResponseDto => {
  let result = {
    "id": lecture.id,
    "title": lecture.title,
    "title_en": lecture.title_en,
    "course": lecture.course_id,
    "old_code": lecture.old_code,
    "class_no": lecture.class_no,
    "year": lecture.year,
    "semester": lecture.semester,
    "code": lecture.code,
    "department": lecture.department_id,
    "department_code": lecture.department.code,
    "department_name": lecture.department.name,
    "department_name_en": lecture.department.name_en,
    "type": lecture.type,
    "type_en": lecture.type_en,
    "limit": lecture.limit,
    "num_people": lecture.num_people,
    "is_english": lecture.is_english,
    "num_classes": lecture.num_classes,
    "num_labs": lecture.num_labs,
    "credit": lecture.credit,
    "credit_au": lecture.credit_au,
    "common_title": lecture.common_title,
    "common_title_en": lecture.common_title_en,
    "class_title": lecture.class_title,
    "class_title_en": lecture.class_title_en,
    "review_total_weight": lecture.review_total_weight,
  };

  const professors = lecture.subject_lecture_professors.map((x) => x.professor);
  const ordered_professors = applyOrder(professors, ["professor_name"]);
  result = Object.assign(result, { "professors": ordered_professors });

  if (nested) {
    return result;
  }

  result = Object.assign(result, {
    "grade": lecture.grade,
    "load": lecture.load,
    "speech": lecture.speech,
    "classtimes": lecture.subject_classtime.map((classtime) => toJsonClasstime(classtime)),
    "examtimes": lecture.subject_examtime.map((examtime) => toJsonExamtime(examtime)),
  });

  return result;
}