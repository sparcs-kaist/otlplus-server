import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { Prisma } from '@prisma/client'
import { randomInt } from 'crypto'

import { FRIEND_CODE_ALPHABET, FriendRepository } from './friend.repository'

jest.mock('crypto', () => ({ ...jest.requireActual('crypto'), randomInt: jest.fn() }))

const random = randomInt as jest.Mock

function setup() {
  const rows = new Map<number, { userprofile_id: number; code: string }>()
  const codes = {
    findUnique: jest.fn(async ({ where }) =>
      where.userprofile_id === undefined
        ? ([...rows.values()].find((row) => row.code === where.code) ?? null)
        : (rows.get(where.userprofile_id) ?? null),
    ),
  }
  const executeRaw = jest.fn(async (_query, userId: number, code: string) => {
    if (rows.has(userId) || [...rows.values()].some((row) => row.code === code)) return 0
    rows.set(userId, { userprofile_id: userId, code })
    return 1
  })
  const repository = new FriendRepository({
    tx: { session_userprofile_friend_codes: codes, $executeRaw: executeRaw },
  } as unknown as TransactionHost<TransactionalAdapterPrisma>)
  return { repository, codes, executeRaw, rows }
}

beforeEach(() => {
  jest.resetAllMocks()
  random.mockReturnValue(0)
})

it('returns the existing permanent code without generating or writing', async () => {
  const { repository, codes, executeRaw, rows } = setup()
  rows.set(42, { userprofile_id: 42, code: 'K7L4MX' })

  await expect(repository.getOrCreateCode(42)).resolves.toBe('K7L4MX')
  expect(codes.findUnique).toHaveBeenCalledWith({ where: { userprofile_id: 42 } })
  expect(random).not.toHaveBeenCalled()
  expect(executeRaw).not.toHaveBeenCalled()
})

it('creates six characters using every symbol in the agreed alphabet with crypto.randomInt', async () => {
  const { repository, executeRaw } = setup()
  let index = 0
  random.mockImplementation(() => index++)

  const generated: string[] = []
  for (let userId = 1; userId <= 4; userId += 1) {
    const code = await repository.getOrCreateCode(userId)
    generated.push(code)
    expect(code).toMatch(/^[ACDEFHJKLMNPQRTUVWXY3479]{6}$/)
    expect(executeRaw).toHaveBeenCalledWith(expect.any(Array), userId, code)
  }
  expect(generated.join('')).toBe('ACDEFHJKLMNPQRTUVWXY3479')
  expect(new Set(FRIEND_CODE_ALPHABET).size).toBe(24)
  expect(random).toHaveBeenCalledTimes(24)
  expect(random.mock.calls.every((args) => args.length === 1 && args[0] === 24)).toBe(true)
})

it('retries a code collision without changing the other owner', async () => {
  const { repository, executeRaw, rows } = setup()
  rows.set(7, { userprofile_id: 7, code: 'AAAAAA' })
  let index = 0
  random.mockImplementation(() => Math.floor(index++ / 6))

  await expect(repository.getOrCreateCode(42)).resolves.toBe('CCCCCC')
  expect(executeRaw).toHaveBeenNthCalledWith(1, expect.any(Array), 42, 'AAAAAA')
  expect(executeRaw).toHaveBeenNthCalledWith(2, expect.any(Array), 42, 'CCCCCC')
  expect(rows.get(7)).toEqual({ userprofile_id: 7, code: 'AAAAAA' })
})

it('returns the same winning code to concurrent requests without overwriting', async () => {
  const { repository, executeRaw, rows } = setup()
  let index = 0
  random.mockImplementation(() => Math.floor(index++ / 6))

  await expect(Promise.all([repository.getOrCreateCode(42), repository.getOrCreateCode(42)])).resolves.toEqual([
    'AAAAAA',
    'AAAAAA',
  ])
  expect(executeRaw).toHaveBeenCalledTimes(2)
  expect(rows.size).toBe(1)
  expect(rows.get(42)).toEqual({ userprofile_id: 42, code: 'AAAAAA' })
  await expect(repository.getOrCreateCode(42)).resolves.toBe('AAAAAA')
  expect(executeRaw).toHaveBeenCalledTimes(2)
})

it('stops after ten collisions instead of retrying forever', async () => {
  const { repository, codes, executeRaw, rows } = setup()
  rows.set(7, { userprofile_id: 7, code: 'AAAAAA' })

  await expect(repository.getOrCreateCode(42)).rejects.toThrow('Could not allocate a unique friend code')
  expect(executeRaw).toHaveBeenCalledTimes(10)
  expect(codes.findUnique).toHaveBeenCalledTimes(11)
})

it.each([
  new Error('Database unavailable'),
  new Prisma.PrismaClientKnownRequestError('Foreign key constraint failed', { code: 'P2010', clientVersion: '6.19.3' }),
])('propagates non-unique creation errors: %s', async (error) => {
  const { repository, codes, executeRaw } = setup()
  executeRaw.mockRejectedValue(error)

  await expect(repository.getOrCreateCode(42)).rejects.toBe(error)
  expect(executeRaw).toHaveBeenCalledTimes(1)
  expect(codes.findUnique).toHaveBeenCalledTimes(1)
})

it('propagates lookup errors without attempting to create a new code', async () => {
  const { repository, codes, executeRaw } = setup()
  const error = new Error('Database unavailable')
  codes.findUnique.mockRejectedValue(error)

  await expect(repository.getOrCreateCode(42)).rejects.toBe(error)
  expect(executeRaw).not.toHaveBeenCalled()
})

it.each([true, false])('looks up the code owner or returns null (exists: %s)', async (exists) => {
  const { repository, codes, rows } = setup()
  if (exists) rows.set(42, { userprofile_id: 42, code: 'K7L4MX' })

  await expect(repository.getUserIdByCode('K7L4MX')).resolves.toBe(exists ? 42 : null)
  expect(codes.findUnique).toHaveBeenCalledWith({ where: { code: 'K7L4MX' }, select: { userprofile_id: true } })
})

describe('current schedule query', () => {
  const findMany = jest.fn()
  const queryRaw = jest.fn()
  const repository = new FriendRepository({ tx: { session_userprofile_friends: { findMany }, $queryRaw: queryRaw } } as never)

  beforeEach(() => queryRaw.mockResolvedValue([]))

  it('matches enrolled lectures or any term-scoped timetable lecture/custom block, selecting only owned relation IDs', async () => {
    const terms = [{ year: 2026, semester: 3 }, { year: 2027, semester: 1 }]
    findMany.mockResolvedValue([{ id: 101 }, { id: 102 }])
    await expect(repository.getFriendIdsWithScheduleAt(42, [101, 102, 103], terms, 0, 635)).resolves.toEqual([101, 102])

    const time = new Date('1970-01-01T10:35:00.000Z')
    expect(findMany).toHaveBeenCalledTimes(1)
    expect(findMany).toHaveBeenCalledWith({
      select: { id: true },
      where: {
        userprofile_id: 42,
        id: { in: [101, 102, 103] },
        friend_profile: {
          OR: terms.flatMap((term) => {
            const lecture = {
              ...term,
              deleted: false,
              subject_classtime: { some: { day: 0, begin: { lte: time }, end: { gt: time } } },
            }
            return [
              { taken_lectures: { some: { lecture } } },
              {
                timetable_timetable: {
                  some: {
                    ...term,
                    OR: [
                      { timetable_timetable_lectures: { some: { subject_lecture: lecture } } },
                      {
                        timetable_timetable_customblocks: {
                          some: { block_custom_blocks: { day: 0, begin: { lte: 635 }, end: { gt: 635 } } },
                        },
                      },
                    ],
                  },
                },
              },
            ]
          }),
        },
      },
    })
  })

  it('adds later custom-block slots in one scoped query, ignoring stale first children and duplicate matches', async () => {
    findMany.mockResolvedValue([{ id: 101 }])
    queryRaw.mockResolvedValue([{ id: 101 }, { id: 102 }])
    const terms = [{ year: 2026, semester: 3 }, { year: 2027, semester: 1 }]
    await expect(repository.getFriendIdsWithScheduleAt(42, [101, 102, 103], terms, 2, 710)).resolves.toEqual([101, 102])
    expect(findMany).toHaveBeenCalledTimes(1)
    expect(queryRaw).toHaveBeenCalledTimes(1)
    const query = queryRaw.mock.calls[0][0] as Prisma.Sql
    const sql = query.sql.replace(/\s+/g, ' ').trim()
    expect(sql).toContain('friend.userprofile_id = ? AND friend.id IN (?,?,?)')
    expect(sql).toContain('timetable.user_id = friend.friend_userprofile_id')
    expect(sql).toContain('(timetable.year = ? AND timetable.semester = ?) OR (timetable.year = ? AND timetable.semester = ?)')
    expect(sql).toContain('slot.day = ? AND slot.begin <= ? AND slot.end > ?')
    expect(sql).toContain('first_slot.custom_block_id = slot.custom_block_id AND first_slot.id < slot.id')
    expect(query.values).toEqual([42, 101, 102, 103, 2026, 3, 2027, 1, 2, 710, 710])
  })

  it.each([
    [0, '1970-01-01T00:00:00.000Z'],
    [1439, '1970-01-01T23:59:00.000Z'],
  ])('represents minute %i as a UTC-anchored MySQL TIME with inclusive start and exclusive end', async (minute, iso) => {
    findMany.mockResolvedValue([])
    await repository.getFriendIdsWithScheduleAt(42, [101], [{ year: 2026, semester: 3 }], 6, minute)
    const filter = findMany.mock.calls[0][0].where.friend_profile.OR[0].taken_lectures.some.lecture.subject_classtime.some
    expect(filter).toEqual({ day: 6, begin: { lte: new Date(iso) }, end: { gt: new Date(iso) } })
    expect(queryRaw.mock.calls[0][0].values.slice(-3)).toEqual([6, minute, minute])
  })

  it.each([
    [[], [{ year: 2026, semester: 3 }]],
    [[101], []],
  ])('skips database access with no friends or no active terms', async (friendIds, terms) => {
    await expect(repository.getFriendIdsWithScheduleAt(42, friendIds, terms, 0, 635)).resolves.toEqual([])
    expect(findMany).not.toHaveBeenCalled()
    expect(queryRaw).not.toHaveBeenCalled()
  })
})
