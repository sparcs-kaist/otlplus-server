export interface LectureQuery {
  department?: string[]

  type?: string[]

  level?: string[]

  group?: string[]

  keyword?: string

  term?: string[]

  order?: string[]

  offset?: number

  limit?: number

  year?: number

  semester?: number

  day?: number

  begin?: number

  end?: number

  has_vacancy?: boolean // 빈자리 있는 강의만 필터
}
