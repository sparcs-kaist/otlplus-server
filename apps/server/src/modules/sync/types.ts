export type LectureDerivedDepartmentInfo = {
  id: number
  num_id: string
  code: string
  name: string
  name_en: string
}

export type LectureDerivedCourseInfo = {
  old_code: string
  new_code: string
  department_id: number
  type: string
  type_en: string
  title: string
  title_en: string
}

export type ChargeDerivedProfessorInfo = {
  professor_id: number
  professor_name: string
  professor_name_en: string
  major: string
}

export type DerivedLectureInfo = {
  code: string
  new_code: string
  year: number
  semester: number
  class_no: string
  department_id: number
  old_code: string
  title: string
  title_en: string
  type: string
  type_en: string
  audience: number
  limit: number
  credit: number
  credit_au: number
  num_classes: number
  num_labs: number
  is_english: boolean
  course_id: number
}

export type DerivedExamtimeInfo = {
  day: number
  begin: Date
  end: Date
}

export type DerivedClasstimeInfo = {
  day: number
  begin: Date
  end: Date
  type: 'l' | 'e'
  building_id: string
  room_name: string
  building_full_name: string
  building_full_name_en: string
  unit_time: number | null
}
