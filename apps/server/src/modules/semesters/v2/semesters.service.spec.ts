import { subject_semester } from '@prisma/client'

import { SemestersServiceV2 } from './semesters.service'

jest.mock('@otl/prisma-client/repositories', () => ({}))

const term = (year: number, semester: number, beginning: string, end: string, addDrop?: string) =>
  ({
    year,
    semester,
    beginning: new Date(beginning),
    end: new Date(end),
    courseAddDropPeriodEnd: addDrop ? new Date(addDrop) : null,
  }) as subject_semester

const fall = term(2026, 3, '2026-09-01T09:00:00+09:00', '2026-12-18T18:00:00+09:00')
const winter = term(2026, 4, '2026-12-21T09:00:00+09:00', '2027-02-01T18:00:00+09:00', '2026-12-23T18:00:00+09:00')
const spring = term(2027, 1, '2027-03-01T09:00:00+09:00', '2027-06-18T18:00:00+09:00')
const laterFall = term(2027, 3, '2027-09-01T09:00:00+09:00', '2027-12-18T18:00:00+09:00')

describe('SemestersServiceV2 current semester', () => {
  afterEach(() => jest.useRealTimers())

  it.each([
    ['regular end instant', '2026-12-18T18:00:00+09:00', [fall, winter, spring], fall],
    ['after regular end, before seasonal beginning', '2026-12-18T18:00:00.001+09:00', [fall, winter, spring], winter],
    ['after seasonal add/drop end', '2026-12-23T18:00:00.001+09:00', [fall, winter, spring, laterFall], spring],
  ])('selects %s', async (_label, instant, semesters, expected) => {
    jest.useFakeTimers().setSystemTime(new Date(instant))
    const repository = {
      getSemestersInYearRange: jest.fn().mockResolvedValue(semesters),
      getFallbackSemester: jest.fn(),
    }
    const service = new SemestersServiceV2(repository as never)

    await expect(service.getCurrentSemester()).resolves.toEqual(expected)
  })

  it('uses the fallback when the range only contains future semesters', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-12-20T12:00:00+09:00'))
    const repository = {
      getSemestersInYearRange: jest.fn().mockResolvedValue([spring]),
      getFallbackSemester: jest.fn().mockResolvedValue(fall),
    }
    await expect(new SemestersServiceV2(repository as never).getCurrentSemester()).resolves.toEqual(fall)
    expect(repository.getFallbackSemester).toHaveBeenCalledWith(new Date())
  })
})
