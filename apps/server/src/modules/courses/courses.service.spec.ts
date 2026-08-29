import { CourseRepository, LectureRepository } from '@otl/prisma-client/repositories'

import { CoursesService } from './courses.service'

describe('CoursesService', () => {
  it('includes a matching course when its representative lecture is missing', async () => {
    const courseRepository = Object.assign(Object.create(CourseRepository.prototype), {
      getCourses: jest.fn().mockResolvedValue([
        {
          id: 42,
          old_code: 'CS206',
          new_code: 'CS206',
          department_id: 1,
          type: '전공필수',
          type_en: 'Major Required',
          title: '자료구조',
          title_en: 'Data Structures',
          summury: '',
          grade_sum: 0,
          load_sum: 0,
          speech_sum: 0,
          review_total_weight: 0,
          grade: 4,
          load: 3,
          speech: 4,
          latest_written_datetime: null,
          title_no_space: '자료구조',
          title_en_no_space: 'DataStructures',
          representative_lecture_id: 999,
          level: '2',
          subject_department: {
            id: 1,
            name: '전산학부',
            name_en: 'School of Computing',
            code: 'CS',
          },
          subject_course_professors: [],
        },
      ]),
      isUserSpecificRead: jest.fn(),
    })
    const lectureRepository = Object.assign(Object.create(LectureRepository.prototype), {
      getLecturesByIds: jest.fn().mockResolvedValue([]),
    })
    const service = new CoursesService(courseRepository, lectureRepository)

    const result = await service.getCourses({ keyword: '자료구조', limit: 1 }, undefined)

    expect(result).toEqual([
      expect.objectContaining({
        id: 42,
        title: '자료구조',
        credit: 0,
        userspecific_is_read: false,
      }),
    ])
  })
})
