import { CourseRepositoryV2 } from './course.v2.repository'

describe('CourseRepositoryV2.departmentCodeFilter', () => {
  const repository = new CourseRepositoryV2({} as any)

  it('returns null when no department code is given', () => {
    expect(repository.departmentCodeFilter(undefined)).toBeNull()
  })

  it('matches every department sharing the given codes', () => {
    expect(repository.departmentCodeFilter(['TS', 'CS'])).toEqual({
      OR: [{ subject_department: { code: { in: ['TS', 'CS'] } } }],
    })
  })

  it('treats ETC as every department outside the major codes', () => {
    const filter = repository.departmentCodeFilter(['ETC']) as { OR: any[] }

    expect(filter.OR).toHaveLength(1)
    const { notIn } = filter.OR[0].subject_department.code
    expect(notIn).toEqual(expect.arrayContaining(['CS', 'TS', 'AIC']))
    expect(notIn).not.toContain('ETC')
  })

  it('combines codes and ETC with OR', () => {
    const filter = repository.departmentCodeFilter(['TS', 'ETC']) as { OR: any[] }

    expect(filter.OR).toHaveLength(2)
    expect(filter.OR[0]).toEqual({ subject_department: { code: { in: ['TS'] } } })
    expect(filter.OR[1].subject_department.code.notIn).toEqual(expect.arrayContaining(['TS']))
  })
})
