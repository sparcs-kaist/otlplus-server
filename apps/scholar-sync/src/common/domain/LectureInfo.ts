import { ELecture } from '@otl/prisma-client/entities';
import { IScholar } from '@otl/scholar-sync/clients/scholar/IScholar';

export class LectureInfo {
  code!: string;
  new_code!: string;
  year!: number;
  semester!: number;
  class_no!: string;
  department_id!: number;
  old_code!: string;
  title!: string;
  title_en!: string;
  type!: string;
  type_en!: string;
  audience!: number;
  limit!: number;
  credit!: number;
  credit_au!: number;
  num_classes!: number;
  num_labs!: number;
  is_english!: boolean;
  course_id!: number;

  public static deriveLectureInfo(lecture: IScholar.ScholarLectureType, course_id: number): LectureInfo {
    return {
      code: lecture.SUBJECT_NO,
      new_code: lecture.SUBJECT_NO,
      year: lecture.LECTURE_YEAR,
      semester: lecture.LECTURE_TERM,
      class_no: lecture.LECTURE_CLASS.trim(),
      department_id: lecture.DEPT_ID,
      old_code: lecture.OLD_NO,
      title: lecture.SUB_TITLE,
      title_en: lecture.E_SUB_TITLE,
      type: lecture.SUBJECT_TYPE,
      type_en: lecture.E_SUBJECT_TYPE,
      audience: lecture.COURSE_SECT,
      limit: lecture.LIMIT,
      credit: lecture.CREDIT,
      credit_au: lecture.ACT_UNIT,
      num_classes: lecture.LECTURE,
      num_labs: lecture.LAB,
      is_english: lecture.ENGLISH_LEC === 'Y',
      course_id,
    };
  }

  public static equals(existing: ELecture.Details, lecture: LectureInfo) {
    return (
      // TODO: This can be problematic if multiple lectures have the same old code
      // -> new_code(=code)를 기준으로 lecture 구분하므로 code가 다르면 다른 lecture로 취급해야 함
      existing.year !== lecture.year &&
      existing.semester !== lecture.semester &&
      existing.class_no !== lecture.class_no &&
      existing.department_id !== lecture.department_id &&
      existing.old_code !== lecture.old_code &&
      existing.title !== lecture.title &&
      existing.title_en !== lecture.title_en &&
      existing.type !== lecture.type &&
      existing.type_en !== lecture.type_en &&
      existing.audience !== lecture.audience &&
      existing.limit !== lecture.limit &&
      existing.credit !== lecture.credit &&
      existing.credit_au !== lecture.credit_au &&
      existing.num_classes !== lecture.num_classes &&
      existing.num_labs !== lecture.num_labs &&
      existing.is_english !== lecture.is_english &&
      existing.course_id !== lecture.course_id &&
      existing.new_code !== lecture.code
    );
  }
}
