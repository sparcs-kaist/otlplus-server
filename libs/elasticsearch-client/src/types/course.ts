export const COURSES_INDEX = 'courses'

export interface CourseDocument {
  id: number
  title: string
  title_en: string
  title_no_space: string
  title_en_no_space: string
  old_code: string
  new_code: string
  type: string
  type_en: string
  level: string
  department_id: number
  department_name: string
  department_name_en: string
  professor_names: string[]
  professor_names_en: string[]
  summary: string | null
}
