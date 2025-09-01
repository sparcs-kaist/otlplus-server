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
}

export interface v2LectureQuery {
  keyword?: string
  type?: string
  department?: number
  level?: number
  limit?: number
  year?: number
  semester?: number
  day?: number
  begin?: number
  end?: number
}
