import { SemesterRepository } from './semester.repository'

describe('SemesterRepository active semesters', () => {
  it('selects only terms containing the exact instant, without the next-semester fallback', async () => {
    const now = new Date('2026-09-28T01:35:00.000Z')
    const active = [{ year: 2026, semester: 3 }]
    const findMany = jest.fn().mockResolvedValue(active)
    const repository = new SemesterRepository({ subject_semester: { findMany } } as never)
    await expect(repository.getActiveSemestersAt(now)).resolves.toEqual(active)
    expect(findMany).toHaveBeenCalledWith({
      where: { beginning: { lte: now }, end: { gte: now } },
      select: { year: true, semester: true },
    })
  })
})

describe('SemesterRepository fallback semester', () => {
  it('includes a semester ending at the exact instant and does not limit the year', async () => {
    const now = new Date('2026-12-18T09:00:00Z')
    const ended = { year: 2020, semester: 4 }
    const findFirst = jest.fn().mockResolvedValue(ended)
    const repository = new SemesterRepository({ subject_semester: { findFirst } } as never)

    await expect(repository.getFallbackSemester(now)).resolves.toEqual(ended)
    expect(findFirst).toHaveBeenCalledTimes(1)
    expect(findFirst).toHaveBeenCalledWith({
      where: { end: { lte: now } },
      orderBy: [{ year: 'desc' }, { semester: 'desc' }],
    })
  })
})
