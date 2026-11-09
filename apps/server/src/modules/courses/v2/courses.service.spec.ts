import { session_userprofile } from '@prisma/client'

import { ECourseV2 } from '@otl/prisma-client/entities'

import { CoursesServiceV2 } from './courses.service'

jest.mock('@otl/prisma-client/repositories', () => ({
  CourseRepositoryV2: class {},
  LectureRepository: class {},
}))
jest.mock('@otl/prisma-client/repositories/professor.repository.v2', () => ({ ProfessorRepositoryV2: class {} }))

function course(id: number): ECourseV2.BasicWithProfessors {
  return {
    id,
    title: `과목${id}`,
    title_en: `Course${id}`,
    new_code: `CS.${id}`,
    type: '전공필수',
    type_en: 'Major Required',
    summury: '',
    subject_department: { id: 1, name: '전산학부', name_en: 'School of Computing' },
    subject_course_professors: [],
  } as unknown as ECourseV2.BasicWithProfessors
}

function setup(
  openCourseIds: number[],
  takenCourseIds: number[] = [],
  currentSemester: { year: number; semester: number } | null = { year: 2026, semester: 3 },
) {
  const courseRepository = {
    getCourses: jest.fn().mockResolvedValue({ queryResult: [course(1), course(2), course(3)], totalCount: 3 }),
    getOpenCourseIds: jest.fn().mockResolvedValue(openCourseIds),
    getTakenCourseIdsByUser: jest.fn().mockResolvedValue(takenCourseIds),
  }
  const semestersService = {
    getCurrentSemester: jest.fn().mockResolvedValue(currentSemester ?? undefined),
  }
  const service = new CoursesServiceV2(courseRepository as any, {} as any, {} as any, semestersService as any)
  return { service, courseRepository }
}

describe('CoursesServiceV2.getCourses', () => {
  it('marks courses with a lecture in the current semester as open', async () => {
    const { service, courseRepository } = setup([1, 3])

    const result = await service.getCourses({} as any, null, 'ko')

    expect(courseRepository.getOpenCourseIds).toHaveBeenCalledWith([1, 2, 3], 2026, 3)
    expect(result.courses.map(({ id, open }) => ({ id, open }))).toEqual([
      { id: 1, open: true },
      { id: 2, open: false },
      { id: 3, open: true },
    ])
  })

  it('keeps open independent of completed', async () => {
    const { service } = setup([1], [2])

    const result = await service.getCourses({} as any, { id: 7 } as session_userprofile, 'ko')

    expect(result.courses.map(({ id, open, completed }) => ({ id, open, completed }))).toEqual([
      { id: 1, open: true, completed: false },
      { id: 2, open: false, completed: true },
      { id: 3, open: false, completed: false },
    ])
  })

  it('treats every course as not open when there is no semester', async () => {
    const { service, courseRepository } = setup([1], [], null)

    const result = await service.getCourses({} as any, null, 'ko')

    expect(courseRepository.getOpenCourseIds).not.toHaveBeenCalled()
    expect(result.courses.every(({ open }) => !open)).toBe(true)
  })
})
