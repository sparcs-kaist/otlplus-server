import { IScholar } from '@otl/scholar-sync/clients/scholar/IScholar'

import { ECourse } from '@otl/prisma-client/entities'

export class CourseInfo {
  old_code!: string

  new_code!: string

  department_id!: number

  type!: string

  type_en!: string

  title!: string

  title_en!: string

  public static deriveCourseInfo(lecture: IScholar.ScholarLectureType): CourseInfo {
    return {
      old_code: lecture.OLD_NO,
      new_code: lecture.SUBJECT_NO,
      department_id: lecture.DEPT_ID,
      type: lecture.SUBJECT_TYPE,
      type_en: lecture.E_SUBJECT_TYPE,
      title: lecture.SUB_TITLE.split('<')[0].split('[')[0].trim(),
      title_en: lecture.E_SUB_TITLE.split('<')[0].split('[')[0].trim(),
    }
  }

  public static equals(course: CourseInfo, existing: ECourse.Basic) {
    return (
      existing.department_id === course.department_id
      && existing.type === course.type
      && existing.type_en === course.type_en
      && existing.title === course.title
      && existing.title_en === course.title_en
    )
  }
}
