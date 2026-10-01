import { PrismaService } from '../prisma.service'
import { TimetableLectureMiddleware } from './prisma.timetablelecture'

let prisma: PrismaService
jest.mock('../prisma.service', () => ({
  PrismaService: jest.fn(() => ({
    subject_lecture: { update: jest.fn() },
    timetable_timetable: { findMany: jest.fn() },
    $transaction: jest.fn(),
  })),
}))

it.each([
  { lecture_id: 10, timetable_id: 1 },
  [{ lecture_id: 10, timetable_id: 1 }, { lecture_id: 20, timetable_id: 2 }],
])('handles both Prisma createMany input shapes', async (data) => {
  prisma = new PrismaService({})
  const update = jest.spyOn(prisma.subject_lecture, 'update').mockResolvedValue({} as Awaited<ReturnType<typeof prisma.subject_lecture.update>>)
  jest.spyOn(prisma.timetable_timetable, 'findMany').mockResolvedValue([])
  jest.spyOn(prisma, '$transaction').mockImplementation(async (run) => {
    if (typeof run !== 'function') throw new Error('Expected interactive transaction')
    return run(prisma)
  })
  const middleware = new TimetableLectureMiddleware(prisma)
  await expect(middleware.postExecute('createMany', { data }, { count: 1 })).resolves.toBe(true)
  const lectureIds = (Array.isArray(data) ? data : [data]).map((row) => row.lecture_id)
  expect(update.mock.calls.map(([query]) => query.where.id)).toEqual(lectureIds)
})
