import { ICourse, IReview } from '@otl/server-nest/common/interfaces'

import { CHANNEL_TALK_FUNCTION } from './channel-talk.contract'
import { ChannelTalkService } from './channel-talk.service'

const course: ICourse.DetailWithIsRead = {
  id: 101,
  old_code: 'CS101',
  old_old_code: 'CS101',
  department: { id: 1, name: '전산학부', name_en: 'School of Computing', code: 'CS' },
  type: '전공필수',
  type_en: 'Major Required',
  title: '프로그래밍기초',
  title_en: 'Introduction to Programming',
  summary: '',
  review_total_weight: 12,
  credit: 3,
  credit_au: 0,
  num_classes: 3,
  num_labs: 1,
  related_courses_prior: [],
  related_courses_posterior: [],
  professors: [{ name: '홍길동', name_en: 'Gildong Hong', professor_id: 7, review_total_weight: 10 }],
  grade: 3.5,
  load: 2.5,
  speech: 4.5,
  userspecific_is_read: false,
}

const review: IReview.Basic = {
  id: 501,
  course: { id: course.id },
  lecture: {
    id: 301,
    title: course.title,
    title_en: course.title_en,
    course: course.id,
    old_old_code: course.old_old_code,
    old_code: course.old_code,
    class_no: 'A',
    year: 2026,
    semester: 1,
    code: 'CS101-A',
    department: 1,
    department_code: 'CS',
    department_name: '전산학부',
    department_name_en: 'School of Computing',
    type: course.type,
    type_en: course.type_en,
    limit: 100,
    num_people: 80,
    is_english: false,
    num_classes: 3,
    num_labs: 1,
    credit: 3,
    credit_au: 0,
    common_title: '',
    common_title_en: '',
    class_title: '',
    class_title_en: '',
    review_total_weight: 12,
    professors: course.professors,
  },
  content: '과제가 적당하고 설명이 명확합니다.',
  like: 4,
  is_deleted: 0,
  grade: 4,
  load: 3,
  speech: 5,
  userspecific_is_liked: false,
}

class FakeCourseCatalog {
  async getCourses(query: ICourse.Query, _user: undefined): Promise<ICourse.DetailWithIsRead[]> {
    return query.keyword === '프로그래밍' ? [course] : []
  }

  async getReviewsByCourseId(_query: ICourse.ReviewQueryDto, id: number, _user: undefined): Promise<IReview.Basic[]> {
    return id === course.id ? [review] : []
  }
}

describe('ChannelTalkService', () => {
  const service = new ChannelTalkService(new FakeCourseCatalog())

  it('discovers the command metadata and ALF action functions', async () => {
    const response = await service.handle('v1', {
      method: CHANNEL_TALK_FUNCTION.discover,
      params: {},
      systemVersion: 'v1',
    })

    expect(response).toEqual({
      result: {
        functions: expect.arrayContaining([
          expect.objectContaining({ name: CHANNEL_TALK_FUNCTION.commands }),
          expect.objectContaining({ name: CHANNEL_TALK_FUNCTION.searchCourses }),
          expect.objectContaining({ name: CHANNEL_TALK_FUNCTION.listCourseReviews }),
        ]),
        success: true,
        errorMessage: '',
      },
    })
  })

  it('returns a text command result for a course search', async () => {
    const response = await service.handle('v1', {
      method: CHANNEL_TALK_FUNCTION.searchCourses,
      params: { input: { keyword: '프로그래밍', limit: 5 } },
      systemVersion: 'v1',
    })

    expect(response).toEqual({
      result: {
        type: 'text',
        attributes: {
          message: expect.stringContaining('[과목 ID: 101] 프로그래밍기초'),
        },
      },
    })
  })

  it('returns a text command result for course reviews', async () => {
    const response = await service.handle('v1', {
      method: CHANNEL_TALK_FUNCTION.listCourseReviews,
      params: { input: { courseId: 101, limit: 5 } },
      systemVersion: 'v1',
    })

    expect(response).toEqual({
      result: {
        type: 'text',
        attributes: {
          message: expect.stringContaining('과제가 적당하고 설명이 명확합니다.'),
        },
      },
    })
  })

  it('returns an invalidParams error for an empty keyword', async () => {
    const response = await service.handle('v1', {
      method: CHANNEL_TALK_FUNCTION.searchCourses,
      params: { input: { keyword: '' } },
      systemVersion: 'v1',
    })

    expect(response).toEqual({
      error: {
        code: 2,
        type: 'invalidParams',
        message: 'keyword must be a non-empty string',
      },
    })
  })
})
