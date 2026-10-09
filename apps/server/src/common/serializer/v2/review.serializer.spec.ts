import { EReview } from '@otl/prisma-client/entities'

import { toJsonReviewV2 } from './review.serializer'

describe('toJsonReviewV2', () => {
  const review = {
    id: 1,
    content: 'content',
    like: 0,
    grade: 3,
    load: 3,
    speech: 3,
    is_deleted: 0,
    course: { id: 10 },
    lecture: {
      id: 20,
      title: '자료구조',
      title_en: 'Data Structure',
      year: 2026,
      semester: 1,
      subject_lecture_professors: [
        {
          id: 300,
          lecture_id: 20,
          professor_id: 42,
          professor: {
            id: 42,
            professor_id: 9999,
            professor_name: '홍길동',
            professor_name_en: 'Gildong Hong',
          },
        },
      ],
    },
    review_reviewvote: [],
  } as unknown as EReview.Extended

  it('uses subject_professor.id (not the external professor_id) as professor id', () => {
    const result = toJsonReviewV2(review)

    expect(result.professors).toEqual([{ id: 42, name: '홍길동' }])
  })
})
