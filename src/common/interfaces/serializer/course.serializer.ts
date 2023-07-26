import { subject_course } from "../../../prisma/generated/prisma-class/subject_course";
import { subject_lecture } from "../../../prisma/generated/prisma-class/subject_lecture";
import { toJsonDepartment } from "./department.serializer";
import { ProfessorResponseDto } from "../dto/professor/professor.response.dto";
import { toJsonProfessor } from "./professor.serializer";
import { applyOrder } from "../../utils/search.utils";
import { subject_professor } from "../../../prisma/generated/prisma-class/subject_professor";
import { CourseResponseDtoNested } from "../dto/course/course.response.dto";

export const toJsonCourse = (course: subject_course, lecture: subject_lecture, professor: subject_professor[], nested = false): CourseResponseDtoNested => {
  const professorJson: ProfessorResponseDto[] = toJsonProfessor(professor, true);
  const professorSorted = applyOrder<ProfessorResponseDto>(professorJson, ["name"]);

  let result = {
    "id": course.id,
    "old_code": course.old_code,
    "department": toJsonDepartment(course.subject_department, true),
    "type": course.type,
    "type_en": course.type_en,
    "title": course.title,
    "title_en": course.title_en,
    "summary": course.summury, // Todo: fix summury typo in db.
    "review_total_weight": course.review_total_weight,
    "credit": lecture.credit ?? null,
    "credit_au": lecture.credit_au ?? null,
    "num_classes": lecture.num_classes ?? null,
    "num_labs": lecture.num_labs ?? null
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
    "speech": course.speech
  });
  return result;
};