import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { Prisma } from '@prisma/client'
import { randomInt } from 'crypto'

import { FRIEND_CODE_ALPHABET, FriendRepository } from './friend.repository'

jest.mock('crypto', () => ({ ...jest.requireActual('crypto'), randomInt: jest.fn() }))

const random = randomInt as jest.Mock

function setup() {
  const rows = new Map<string, { userprofile_id: number; code: string; is_changed: boolean }>()
  const codes = {
    findFirst: jest.fn(async ({ where }) => [...rows.values()].find((row) =>
      Object.entries(where).every(([key, value]) => row[key as keyof typeof row] === value)) ?? null),
    create: jest.fn(async ({ data }) => {
      if (rows.has(data.code)) {
        throw new Prisma.PrismaClientKnownRequestError('Duplicate code', { code: 'P2002', clientVersion: '6.19.3' })
      }
      const row = { ...data, is_changed: false }
      rows.set(data.code, row)
      return row
    }),
    updateMany: jest.fn(async ({ where, data }) => {
      for (const row of rows.values()) {
        if (row.userprofile_id === where.userprofile_id && row.is_changed === where.is_changed) Object.assign(row, data)
      }
    }),
  }
  const queryRaw = jest.fn()
  const withTransaction = jest.fn(async (work: () => unknown) => work())
  const repository = new FriendRepository({
    tx: { session_userprofile_friend_codes: codes, $queryRaw: queryRaw },
    withTransaction,
  } as unknown as TransactionHost<TransactionalAdapterPrisma>)
  return { repository, codes, queryRaw, withTransaction, rows }
}

beforeEach(() => {
  jest.resetAllMocks()
  random.mockReturnValue(0)
})

it('returns only the active code without generating, writing or locking', async () => {
  const { repository, queryRaw, withTransaction, rows } = setup()
  rows.set('AAAAAA', { userprofile_id: 42, code: 'AAAAAA', is_changed: true })
  rows.set('K7L4MX', { userprofile_id: 42, code: 'K7L4MX', is_changed: false })
  await expect(repository.getOrCreateCode(42)).resolves.toBe('K7L4MX')
  expect(random).not.toHaveBeenCalled()
  expect(queryRaw).not.toHaveBeenCalled()
  expect(withTransaction).not.toHaveBeenCalled()
})

it('creates six characters using every symbol in the agreed alphabet with crypto.randomInt', async () => {
  const { repository, codes } = setup()
  let index = 0
  random.mockImplementation(() => index++)
  const generated: string[] = []
  for (let userId = 1; userId <= 4; userId += 1) {
    const code = await repository.getOrCreateCode(userId)
    generated.push(code)
    expect(code).toMatch(/^[ACDEFHJKLMNPQRTUVWXY3479]{6}$/)
    expect(codes.create).toHaveBeenCalledWith({ data: { userprofile_id: userId, code } })
  }
  expect(generated.join('')).toBe('ACDEFHJKLMNPQRTUVWXY3479')
  expect(new Set(FRIEND_CODE_ALPHABET).size).toBe(24)
  expect(random).toHaveBeenCalledTimes(24)
  expect(random.mock.calls.every((args) => args.length === 1 && args[0] === 24)).toBe(true)
})

it.each([false, true])('does not reissue another owner code, including changed codes (%s)', async (isChanged) => {
  const { repository, codes, rows } = setup()
  rows.set('AAAAAA', { userprofile_id: 7, code: 'AAAAAA', is_changed: isChanged })
  let index = 0
  random.mockImplementation(() => Math.floor(index++ / 6))
  await expect(repository.getOrCreateCode(42)).resolves.toBe('CCCCCC')
  expect(codes.create).toHaveBeenCalledTimes(2)
  expect(rows.get('AAAAAA')).toEqual({ userprofile_id: 7, code: 'AAAAAA', is_changed: isChanged })
})

it('checks for a winning concurrent allocation after acquiring the owner lock', async () => {
  const { repository, codes, queryRaw, rows } = setup()
  queryRaw.mockImplementationOnce(async () => {
    rows.set('K7L4MX', { userprofile_id: 42, code: 'K7L4MX', is_changed: false })
  })
  await expect(repository.getOrCreateCode(42)).resolves.toBe('K7L4MX')
  expect(codes.create).not.toHaveBeenCalled()
})

it('stops after ten collisions', async () => {
  const { repository, codes, rows } = setup()
  rows.set('AAAAAA', { userprofile_id: 7, code: 'AAAAAA', is_changed: true })
  await expect(repository.getOrCreateCode(42)).rejects.toThrow('Could not allocate a unique friend code')
  expect(codes.create).toHaveBeenCalledTimes(10)
})

it.each([
  new Error('Database unavailable'),
  new Prisma.PrismaClientKnownRequestError('Foreign key constraint failed', { code: 'P2003', clientVersion: '6.19.3' }),
])('propagates non-unique creation errors: %s', async (error) => {
  const { repository, codes } = setup()
  codes.create.mockRejectedValue(error)
  await expect(repository.getOrCreateCode(42)).rejects.toBe(error)
  expect(codes.create).toHaveBeenCalledTimes(1)
})

it('propagates lookup errors without attempting to create a new code', async () => {
  const { repository, codes } = setup()
  const error = new Error('Database unavailable')
  codes.findFirst.mockRejectedValue(error)
  await expect(repository.getOrCreateCode(42)).rejects.toBe(error)
  expect(codes.create).not.toHaveBeenCalled()
})

it.each(['active', 'changed', 'missing'])('accepts only an active code (%s)', async (state) => {
  const { repository, rows } = setup()
  if (state !== 'missing') rows.set('K7L4MX', { userprofile_id: 42, code: 'K7L4MX', is_changed: state === 'changed' })
  await expect(repository.getUserIdByCode('K7L4MX')).resolves.toBe(state === 'active' ? 42 : null)
})

it('marks the current code changed and preserves it when creating its replacement', async () => {
  const { repository, codes, rows } = setup()
  rows.set('AAAAAA', { userprofile_id: 42, code: 'AAAAAA', is_changed: false })
  let index = 0
  random.mockImplementation(() => Math.floor(index++ / 6))
  await expect(repository.regenerateCode(42)).resolves.toBe('CCCCCC')
  expect(codes.create).toHaveBeenCalledTimes(2)
  expect(rows.get('AAAAAA')).toEqual({ userprofile_id: 42, code: 'AAAAAA', is_changed: true })
  await expect(repository.getUserIdByCode('AAAAAA')).resolves.toBeNull()
  await expect(repository.getOrCreateCode(42)).resolves.toBe('CCCCCC')
})

it('creates just one code when regeneration is the first request', async () => {
  const { repository, rows } = setup()
  await expect(repository.regenerateCode(42)).resolves.toBe('AAAAAA')
  expect(rows.size).toBe(1)
})

describe('current schedule query', () => {
  const findMany = jest.fn()
  const queryRaw = jest.fn()
  const repository = new FriendRepository({ tx: { session_userprofile_friends: { findMany }, $queryRaw: queryRaw } } as never)

  beforeEach(() => queryRaw.mockResolvedValue([]))

  it('matches only shared timetable lectures/custom blocks, selecting only owned relation IDs', async () => {
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
              { timetable_timetable: { none: { ...term, is_shared: true } }, taken_lectures: { some: { lecture } } },
              {
                timetable_timetable: {
                  some: {
                    ...term,
                    is_shared: true,
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
    expect(sql).toContain('timetable.is_shared = TRUE')
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
    const filter = findMany.mock.calls[0][0].where.friend_profile.OR[1].timetable_timetable.some.OR[0].timetable_timetable_lectures.some.subject_lecture.subject_classtime.some
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
