import { subject_lecture } from '@prisma/client'

import { toJsonCourseBasic } from './course.serializer'

const course = {
  id: 24754,
  old_code: 'AIC.20101',
  new_code: 'AIC.20101',
  type: '전공필수',
  type_en: 'Major Required',
  title: '딥러닝 개론',
  title_en: 'Introduction to Deep Learning',
  summury: '',
  review_total_weight: 0,
  subject_department: {
    id: 24354,
    name: 'AI컴퓨팅학과',
    name_en: 'AI Computing',
    code: 'AIC',
    num_courses: 0,
    posY: 0,
  },
} as unknown as Parameters<typeof toJsonCourseBasic>[0]

const lecture = {
  credit: 3,
  credit_au: 1,
  num_classes: 3,
  num_labs: 0,
} as unknown as subject_lecture

describe('toJsonCourseBasic', () => {
  it('serializes credits from the representative lecture', () => {
    const result = toJsonCourseBasic(course, lecture)

    expect(result.credit).toBe(3)
    expect(result.credit_au).toBe(1)
    expect(result.num_classes).toBe(3)
    expect(result.num_labs).toBe(0)
  })

  it('serializes a course whose representative lecture is missing', () => {
    const result = toJsonCourseBasic(course, undefined)

    expect(result.id).toBe(24754)
    expect(result.credit).toBe(0)
    expect(result.credit_au).toBe(0)
    expect(result.num_classes).toBe(0)
    expect(result.num_labs).toBe(0)
  })
})
