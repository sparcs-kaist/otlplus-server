import { NotFoundException, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { TransactionHost } from '@nestjs-cls/transactional'
import { IFriendV2 } from '@otl/server-nest/common/interfaces/v2'
import { session_userprofile } from '@prisma/client'

import { EFriend } from '@otl/prisma-client/entities'
import { FriendRepository, LectureRepository, SemesterRepository, TimetableRepository } from '@otl/prisma-client/repositories'

import { FriendsService } from './friends.service'

describe('FriendsService', () => {
  const user = { id: 42 } as session_userprofile
  const friends = {
    getFriends: jest.fn(),
    getFriendIdsWithScheduleAt: jest.fn(),
    getOrCreateCode: jest.fn(),
    getUserIdByCode: jest.fn(),
    getFriend: jest.fn(),
    getFriendsWithCourse: jest.fn(),
    createPair: jest.fn(),
    getFriendByTarget: jest.fn(),
    deletePair: jest.fn(),
  }
  const lectures = { getLectureDetailById: jest.fn(), getTakenLecturesBySemester: jest.fn() }
  const timetables = { getTimeTableWithItemsByIdAndUserId: jest.fn(), getTimetablesByUserId: jest.fn() }
  const semesters = { getActiveSemestersAt: jest.fn() }
  let service: FriendsService

  beforeEach(async () => {
    jest.resetAllMocks()
    const module = await Test.createTestingModule({
      providers: [
        FriendsService,
        { provide: FriendRepository, useValue: friends },
        { provide: LectureRepository, useValue: lectures },
        { provide: TimetableRepository, useValue: timetables },
        { provide: SemesterRepository, useValue: semesters },
        {
          provide: TransactionHost,
          useValue: { withTransaction: (_propagation: unknown, _options: unknown, work: () => unknown) => work() },
        },
      ],
    }).compile()
    service = module.get(FriendsService)
  })

  afterEach(() => jest.useRealTimers())

  describe('current schedule', () => {
    const now = new Date('2026-09-28T01:35:37.000Z')
    const term = { year: 2026, semester: 3 }
    const list = [
      { id: 101, is_favorite: true, friend_profile: { first_name: 'One', last_name: 'Friend' } },
      { id: 102, is_favorite: false, friend_profile: { first_name: 'Two', last_name: '' } },
    ]

    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(now)
      friends.getFriends.mockResolvedValue(list)
      semesters.getActiveSemestersAt.mockResolvedValue([term])
      friends.getFriendIdsWithScheduleAt.mockResolvedValue([102])
    })

    it('batches only owned relation IDs, preserves order, and uses one exact KST minute for the entire request', async () => {
      friends.getFriends.mockImplementation(async () => {
        jest.setSystemTime(new Date('2026-09-28T01:36:02.000Z'))
        return list
      })
      await expect(service.getFriends(user)).resolves.toEqual({
        checkedAt: now.toISOString(),
        friends: [
          { id: 101, name: 'One Friend', isFavorite: true, hasScheduleNow: false },
          { id: 102, name: 'Two', isFavorite: false, hasScheduleNow: true },
        ],
      })
      expect(friends.getFriends).toHaveBeenCalledWith(42)
      expect(semesters.getActiveSemestersAt).toHaveBeenCalledWith(now)
      expect(friends.getFriendIdsWithScheduleAt).toHaveBeenCalledTimes(1)
      expect(friends.getFriendIdsWithScheduleAt).toHaveBeenCalledWith(42, [101, 102], [term], 0, 635)
    })

    it.each([
      ['2026-09-27T15:00:00.000Z', 0, 0],
      ['2026-09-27T14:59:59.999Z', 6, 1439],
      ['2026-09-25T15:00:00.000Z', 5, 0],
    ])('uses Korean date/day independent of UTC day at %s', async (timestamp, day, minute) => {
      jest.setSystemTime(new Date(timestamp))
      await service.getFriends(user)
      expect(friends.getFriendIdsWithScheduleAt).toHaveBeenCalledWith(42, [101, 102], [term], day, minute)
    })

    it('does not select a future term during vacation and returns unknown without a schedule query', async () => {
      semesters.getActiveSemestersAt.mockResolvedValue([])
      const result = await service.getFriends(user)
      expect(result.friends.map(({ hasScheduleNow }) => hasScheduleNow)).toEqual([null, null])
      expect(friends.getFriendIdsWithScheduleAt).not.toHaveBeenCalled()
    })

    it('checks all active terms in one query without mixing their year and semester', async () => {
      const active = [term, { year: 2026, semester: 4 }]
      semesters.getActiveSemestersAt.mockResolvedValue(active)
      await service.getFriends(user)
      expect(friends.getFriendIdsWithScheduleAt).toHaveBeenCalledWith(42, [101, 102], active, 0, 635)
    })

    it('skips schedule and semester queries for an empty friend list', async () => {
      friends.getFriends.mockResolvedValue([])
      await expect(service.getFriends(user)).resolves.toEqual({ checkedAt: now.toISOString(), friends: [] })
      expect(semesters.getActiveSemestersAt).not.toHaveBeenCalled()
      expect(friends.getFriendIdsWithScheduleAt).not.toHaveBeenCalled()
    })

    it('does not convert a failed schedule lookup into a false status', async () => {
      const error = new Error('Database unavailable')
      friends.getFriendIdsWithScheduleAt.mockRejectedValue(error)
      await expect(service.getFriends(user)).rejects.toBe(error)
    })
  })

  it('returns the caller code from the repository without issuing or expiring credentials', async () => {
    friends.getOrCreateCode.mockResolvedValue('K7L4MX')
    await expect(service.getCode(user)).resolves.toEqual({ code: 'K7L4MX' })
    await expect(service.getCode(user)).resolves.toEqual({ code: 'K7L4MX' })
    expect(friends.getOrCreateCode).toHaveBeenNthCalledWith(1, 42)
    expect(friends.getOrCreateCode).toHaveBeenNthCalledWith(2, 42)
  })

  it.each([null, 42])('rejects an unknown or self code owner (%s) without creating a friendship', async (ownerId) => {
    friends.getUserIdByCode.mockResolvedValue(ownerId)
    await expect(service.addFriend(user, 'K7L4MX')).rejects.toMatchObject({ status: 400 })
    expect(friends.getUserIdByCode).toHaveBeenCalledWith('K7L4MX')
    expect(friends.createPair).not.toHaveBeenCalled()
    expect(friends.getFriendByTarget).not.toHaveBeenCalled()
  })

  it('distinguishes the own code from invalid codes without returning profile data', async () => {
    friends.getUserIdByCode.mockResolvedValue(user.id)
    await expect(service.addFriend(user, 'K7L4MX')).rejects.toHaveProperty('response', {
      code: 'SELF_FRIENDSHIP',
      message: 'You cannot add yourself as a friend',
    })
    expect(friends.createPair).not.toHaveBeenCalled()
  })

  it('creates both directions through the pair operation and returns the caller-owned relation', async () => {
    friends.getUserIdByCode.mockResolvedValue(43)
    friends.getFriendByTarget.mockResolvedValue({
      id: 100,
      is_favorite: false,
      friend_profile: { first_name: 'Test', last_name: 'Friend' },
    })
    await expect(service.addFriend(user, 'K7L4MX')).resolves.toEqual({
      friend: { id: 100, name: 'Test Friend', isFavorite: false },
    })
    expect(friends.createPair).toHaveBeenCalledWith(42, 43)
    expect(friends.getFriendByTarget).toHaveBeenCalledWith(42, 43)
  })

  it('allows repeated addition and re-addition after deleting the mutual relationship', async () => {
    friends.getUserIdByCode.mockResolvedValue(43)
    const relation = {
      id: 100,
      friend_userprofile_id: 43,
      is_favorite: false,
      friend_profile: { first_name: 'Test', last_name: 'Friend' },
    }
    friends.getFriendByTarget.mockResolvedValue(relation)
    friends.getFriend.mockResolvedValue(relation)

    const first = await service.addFriend(user, 'K7L4MX')
    await expect(service.addFriend(user, 'K7L4MX')).resolves.toEqual(first)
    await expect(service.deleteFriend(user, 100)).resolves.toEqual({ id: 100 })
    expect(friends.deletePair).toHaveBeenCalledWith(42, 43)
    await expect(service.addFriend(user, 'K7L4MX')).resolves.toEqual(first)
    expect(friends.createPair).toHaveBeenCalledTimes(3)
  })

  it('does not return success if the created caller-owned relation cannot be retrieved', async () => {
    friends.getUserIdByCode.mockResolvedValue(43)
    friends.getFriendByTarget.mockResolvedValue(null)
    await expect(service.addFriend(user, 'K7L4MX')).rejects.toMatchObject({ status: 400 })
  })

  it('requires an owned friendship and scopes the timetable to that friend', async () => {
    friends.getFriend.mockResolvedValue(null)
    await expect(service.getTimetable(user, 7, 99, 'ko')).rejects.toBeInstanceOf(NotFoundException)
    expect(friends.getFriend).toHaveBeenCalledWith(42, 7)
    expect(timetables.getTimeTableWithItemsByIdAndUserId).not.toHaveBeenCalled()

    friends.getFriend.mockResolvedValue({ friend_userprofile_id: 43 })
    timetables.getTimeTableWithItemsByIdAndUserId.mockResolvedValue(null)
    await expect(service.getTimetable(user, 7, 99, 'ko')).rejects.toBeInstanceOf(NotFoundException)
    expect(timetables.getTimeTableWithItemsByIdAndUserId).toHaveBeenCalledWith(99, 43)
  })

  describe('unified timetable items', () => {
    const term = { year: 2026, semester: 3 }
    const lecture = {
      id: 10,
      ...term,
      common_title: '강의',
      common_title_en: 'Lecture',
      title: '강의',
      title_en: 'Lecture',
      subject_department: { id: 1, name: '학과', name_en: 'Department' },
      subject_lecture_professors: [],
      subject_examtime: [],
      subject_classtime: [],
    }
    const first = { day: 0, begin: 635, end: 690 }
    const second = { day: 2, begin: 710, end: 770 }
    const block = { id: 10, block_name: 'Study', place: 'Library', ...first }

    beforeEach(() => friends.getFriend.mockResolvedValue({ friend_userprofile_id: 43 }))

    it('returns lectures and grouped custom blocks together, preserving kinds even when IDs match', async () => {
      timetables.getTimeTableWithItemsByIdAndUserId.mockResolvedValue({
        timetable_timetable_lectures: [{ subject_lecture: lecture }],
        timetable_timetable_customblocks: [{ block_custom_blocks: {
          ...block,
          // A legacy edit changes the canonical parent but leaves the first child stale.
          times: [{ id: 20, ...first, begin: 600 }, { id: 21, ...second }],
        } }],
      })
      const result = await service.getTimetable(user, 7, 99, 'en')
      expect(result.timetableItems).toEqual([
        { kind: 'lecture', data: result.lectures[0] },
        { kind: 'custom', data: { ...block, times: [first, second] } },
      ])
      expect(result.lectures[0]).toMatchObject({ id: 10, name: 'Lecture' })
      expect(timetables.getTimeTableWithItemsByIdAndUserId).toHaveBeenCalledWith(99, 43)
    })

    it('normalizes legacy custom blocks without child times and handles an empty saved timetable', async () => {
      timetables.getTimeTableWithItemsByIdAndUserId.mockResolvedValue({
        timetable_timetable_lectures: [],
        timetable_timetable_customblocks: [{ block_custom_blocks: { ...block, times: [] } }],
      })
      await expect(service.getTimetable(user, 7, 99, 'ko')).resolves.toEqual({
        lectures: [], timetableItems: [{ kind: 'custom', data: { ...block, times: [first] } }],
      })
      timetables.getTimeTableWithItemsByIdAndUserId.mockResolvedValue({
        timetable_timetable_lectures: [], timetable_timetable_customblocks: [],
      })
      await expect(service.getTimetable(user, 7, 99, 'ko')).resolves.toEqual({ lectures: [], timetableItems: [] })
    })

    it('uses the same item contract for enrolled timetables after checking the friendship', async () => {
      friends.getFriend.mockResolvedValueOnce(null)
      await expect(service.getMyTimetable(user, 7, term, 'ko')).rejects.toBeInstanceOf(NotFoundException)
      expect(lectures.getTakenLecturesBySemester).not.toHaveBeenCalled()

      lectures.getTakenLecturesBySemester.mockResolvedValue([lecture])
      const result = await service.getMyTimetable(user, 7, term, 'ko')
      expect(lectures.getTakenLecturesBySemester).toHaveBeenCalledWith(43, 2026, 3)
      expect(result.timetableItems).toEqual([{ kind: 'lecture', data: result.lectures[0] }])
      expect(timetables.getTimeTableWithItemsByIdAndUserId).not.toHaveBeenCalled()
    })

    it('keeps timetable list summaries distinct from the item union', async () => {
      timetables.getTimetablesByUserId.mockResolvedValue([{ id: 99, name: 'Saved', ...term, arrange_order: 2 }])
      await expect(service.getTimetables(user, 7, term)).resolves.toEqual({
        timetables: [{ id: 99, name: 'Saved', ...term, timeTableOrder: 2 }],
      })
      expect(timetables.getTimetablesByUserId).toHaveBeenCalledWith(43, 2026, 3)
    })
  })

  it('includes any official or saved timetable and groups each friend once with exact-section priority', async () => {
    const lecture = {
      id: 10,
      course_id: 100,
      year: 2026,
      semester: 3,
      subject_lecture_professors: [{ professor_id: 5 }],
    }
    const otherSection = { ...lecture, id: 11 }
    const priorTerm = { ...lecture, id: 12, year: 2025 }
    const otherProfessor = { ...priorTerm, id: 13, subject_lecture_professors: [{ professor_id: 6 }] }
    const withLectures = (id: number, taken: (typeof lecture)[], saved: (typeof lecture)[][] = []) => ({
      id,
      is_favorite: false,
      friend_profile: {
        first_name: `Friend ${id}`,
        last_name: '',
        taken_lectures: taken.map((item) => ({ lecture: item })),
        timetable_timetable: saved.map((items, index) => ({
          id: id * 100 + index,
          year: items[0].year,
          semester: items[0].semester,
          timetable_timetable_lectures: items.map((item) => ({ subject_lecture: item })),
        })),
      },
    })
    lectures.getLectureDetailById.mockResolvedValue(lecture)
    friends.getFriendsWithCourse.mockResolvedValue([
      withLectures(1, [lecture, otherSection, priorTerm]),
      withLectures(2, [otherSection, priorTerm]),
      withLectures(3, [priorTerm]),
      withLectures(4, [otherProfessor]),
      withLectures(5, [], [[otherSection], [lecture], [lecture]]),
      withLectures(6, [], [[otherSection], [priorTerm]]),
      withLectures(7, [], [[priorTerm]]),
      withLectures(8, [otherSection], [[lecture]]),
      withLectures(9, [priorTerm], [[otherSection]]),
      withLectures(10, [], []),
      withLectures(11, [], [[otherProfessor]]),
    ])
    const result = await service.getOverlaps(user, 10)
    expect(friends.getFriendsWithCourse).toHaveBeenCalledWith(42, 100)
    expect(result.sameLecture.map(({ id }) => id)).toEqual([1, 5, 8])
    expect(result.sameCourseDifferentSection.map(({ id }) => id)).toEqual([2, 6, 9])
    expect(result.previousSemesterSameProfessor.map(({ id }) => id)).toEqual([3, 7])
    expect(result.sameLecture.map(({ timetable }) => timetable)).toEqual([
      { id: null, year: 2026, semester: 3 },
      { id: 501, year: 2026, semester: 3 },
      { id: 800, year: 2026, semester: 3 },
    ])
    expect(result.sameCourseDifferentSection.map(({ timetable }) => timetable)).toEqual([
      { id: null, year: 2026, semester: 3 },
      { id: 600, year: 2026, semester: 3 },
      { id: 900, year: 2026, semester: 3 },
    ])
    expect(result.previousSemesterSameProfessor.map(({ timetable }) => timetable)).toEqual([
      { id: null, year: 2025, semester: 3 },
      { id: 700, year: 2025, semester: 3 },
    ])
  })

  it('chooses the latest matching term, then official records, then the smallest saved timetable ID', async () => {
    const lecture = {
      id: 10,
      course_id: 100,
      year: 2026,
      semester: 3,
      subject_lecture_professors: [{ professor_id: 5 }],
    }
    const priorLecture = { ...lecture, id: 11, year: 2025 }
    const profile = {
      first_name: 'Test',
      last_name: 'Friend',
      taken_lectures: [{ lecture: { ...priorLecture, year: 2024 } }],
      timetable_timetable: [
        { id: 80, year: 2025, semester: 1 },
        { id: 30, year: 2025, semester: 3 },
        { id: 20, year: 2025, semester: 3 },
      ].map((timetable) => ({
        ...timetable,
        timetable_timetable_lectures: [{
          subject_lecture: { ...priorLecture, year: timetable.year, semester: timetable.semester },
        }],
      })),
    }
    lectures.getLectureDetailById.mockResolvedValue(lecture)
    friends.getFriendsWithCourse.mockResolvedValue([{ id: 7, is_favorite: true, friend_profile: profile }])
    await expect(service.getOverlaps(user, 10)).resolves.toMatchObject({
      previousSemesterSameProfessor: [{
        id: 7,
        name: 'Test Friend',
        isFavorite: true,
        timetable: { id: 20, year: 2025, semester: 3 },
      }],
    })

    profile.taken_lectures.push({ lecture: priorLecture })
    profile.timetable_timetable.reverse()
    await expect(service.getOverlaps(user, 10)).resolves.toMatchObject({
      previousSemesterSameProfessor: [{ timetable: { id: null, year: 2025, semester: 3 } }],
    })

    profile.timetable_timetable.push({
      id: 99,
      year: 2026,
      semester: 1,
      timetable_timetable_lectures: [{ subject_lecture: { ...priorLecture, year: 2026, semester: 1 } }],
    })
    await expect(service.getOverlaps(user, 10)).resolves.toMatchObject({
      previousSemesterSameProfessor: [{ timetable: { id: 99, year: 2026, semester: 1 } }],
    })
  })

  it('uses the matched lecture term for legacy saved timetables without a year or semester', async () => {
    const lecture = {
      id: 10,
      course_id: 100,
      year: 2026,
      semester: 3,
      subject_lecture_professors: [],
    }
    lectures.getLectureDetailById.mockResolvedValue(lecture)
    friends.getFriendsWithCourse.mockResolvedValue([{
      id: 7,
      is_favorite: false,
      friend_profile: {
        first_name: 'Test',
        last_name: 'Friend',
        taken_lectures: [],
        timetable_timetable: [{
          id: 91,
          year: null,
          semester: null,
          timetable_timetable_lectures: [{ subject_lecture: lecture }],
        }],
      },
    }])
    await expect(service.getOverlaps(user, 10)).resolves.toEqual({
      sameLecture: [{
        id: 7,
        name: 'Test Friend',
        isFavorite: false,
        timetable: { id: 91, year: 2026, semester: 3 },
      }],
      sameCourseDifferentSection: [],
      previousSemesterSameProfessor: [],
    })
  })

  it('filters included lecture rows by course, not just the parent friend records', async () => {
    const findMany = jest.fn().mockResolvedValue([])
    const repository = new FriendRepository({ tx: { session_userprofile_friends: { findMany } } } as never)
    await repository.getFriendsWithCourse(42, 100)
    expect(findMany).toHaveBeenCalledTimes(1)
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        ...EFriend.WithCourseLectures(100),
        where: {
          userprofile_id: 42,
          friend_profile: {
            OR: [
              { taken_lectures: { some: { lecture: { course_id: 100 } } } },
              {
                timetable_timetable: {
                  some: { timetable_timetable_lectures: { some: { subject_lecture: { course_id: 100 } } } },
                },
              },
            ],
          },
        },
      }),
    )
    expect(findMany.mock.calls[0][0].select.friend_profile.select.taken_lectures.where).toEqual({
      lecture: { course_id: 100 },
    })
    const savedTimetables = findMany.mock.calls[0][0].select.friend_profile.select.timetable_timetable
    expect(savedTimetables.select).toMatchObject({ id: true, year: true, semester: true })
    expect(savedTimetables.where).toEqual({
      timetable_timetable_lectures: { some: { subject_lecture: { course_id: 100 } } },
    })
    expect(savedTimetables.select.timetable_timetable_lectures.where).toEqual({
      subject_lecture: { course_id: 100 },
    })
  })

  it('preserves JSON false and rejects string booleans', async () => {
    const pipe = new ValidationPipe({ whitelist: true, transform: true })
    const metadata = { type: 'body' as const, metatype: IFriendV2.UpdateFavoriteReqDto }
    await expect(pipe.transform({ isFavorite: false }, metadata)).resolves.toMatchObject({ isFavorite: false })
    await expect(pipe.transform({ isFavorite: 'false' }, metadata)).rejects.toMatchObject({ status: 400 })
  })

  it('normalizes friend codes and strips caller identity supplied in the request body', async () => {
    const pipe = new ValidationPipe({ whitelist: true, transform: true })
    const metadata = { type: 'body' as const, metatype: IFriendV2.AddFriendReqDto }
    const body = await pipe.transform({ code: '  k7l4mx\n', senderId: 999, userId: 999 }, metadata)
    expect(body).toEqual({ code: 'K7L4MX' })
  })

  it.each([
    undefined,
    null,
    123456,
    '',
    'K7L4M',
    'K7L4MXX',
    'K7 LMX',
    'K7-LMX',
    ...Array.from('01IOZ2S5B8G6', (character) => `${character}7L4MX`),
    'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0MyJ9.signature',
  ])('rejects invalid friend code %p', async (code) => {
    const pipe = new ValidationPipe({ whitelist: true, transform: true })
    const metadata = { type: 'body' as const, metatype: IFriendV2.AddFriendReqDto }
    await expect(pipe.transform({ code }, metadata)).rejects.toMatchObject({ status: 400 })
  })
})
