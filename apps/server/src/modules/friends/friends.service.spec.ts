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
    regenerateCode: jest.fn(),
    getUserIdByCode: jest.fn(),
    getFriend: jest.fn(),
    getFriendsWithCourse: jest.fn(),
    createPair: jest.fn(),
    getFriendByTarget: jest.fn(),
    deletePair: jest.fn(),
  }
  const lectures = { getLectureDetailById: jest.fn(), getTakenLecturesBySemester: jest.fn() }
  const timetables = { getSharedTimetableSemesters: jest.fn(), getSharedTimetableForSemester: jest.fn() }
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

  it('regenerates only the caller code without touching existing friendships', async () => {
    friends.regenerateCode.mockResolvedValue('ACDEFH')
    await expect(service.regenerateCode(user)).resolves.toEqual({ code: 'ACDEFH' })
    expect(friends.regenerateCode).toHaveBeenCalledWith(42)
    expect(friends.createPair).not.toHaveBeenCalled()
    expect(friends.deletePair).not.toHaveBeenCalled()
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

  describe('shared timetable contents', () => {
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

    it('lists available shared semesters only after validating the friend relationship', async () => {
      timetables.getSharedTimetableSemesters.mockResolvedValue([term])
      await expect(service.getSharedTimetableSemesters(user, 7)).resolves.toEqual({ semesters: [term] })
      expect(timetables.getSharedTimetableSemesters).toHaveBeenCalledWith(43)
      timetables.getSharedTimetableSemesters.mockClear()
      friends.getFriend.mockResolvedValue(null)
      await expect(service.getSharedTimetableSemesters(user, 7)).rejects.toBeInstanceOf(NotFoundException)
      expect(timetables.getSharedTimetableSemesters).not.toHaveBeenCalled()
    })

    it('resolves the shared source in one read and falls back only when no saved selection exists', async () => {
      timetables.getSharedTimetableForSemester.mockResolvedValue({
        timetable_timetable_lectures: [],
        timetable_timetable_customblocks: [{ block_custom_blocks: { ...block, times: [first, second] } }],
      })
      await expect(service.getSharedTimetable(user, 7, term, 'en')).resolves.toMatchObject({
        lectures: [], customBlocks: [{ id: 10, times: [first, second] }],
      })
      expect(timetables.getSharedTimetableForSemester).toHaveBeenCalledWith(43, 2026, 3)
      expect(lectures.getTakenLecturesBySemester).not.toHaveBeenCalled()
      timetables.getSharedTimetableForSemester.mockResolvedValue({
        timetable_timetable_lectures: [], timetable_timetable_customblocks: [],
      })
      await expect(service.getSharedTimetable(user, 7, term, 'en')).resolves.toMatchObject({ source: 'saved', lectures: [], customBlocks: [] })
      expect(lectures.getTakenLecturesBySemester).not.toHaveBeenCalled()
      timetables.getSharedTimetableForSemester.mockResolvedValue(null)
      lectures.getTakenLecturesBySemester.mockResolvedValue([lecture])
      const fallback = await service.getSharedTimetable(user, 7, term, 'en')
      expect(fallback).toMatchObject({
        ...term, source: 'enrolled', timetableId: null, name: 'Enrolled timetable',
        lectures: [{ id: 10 }], customBlocks: [],
      })
      expect(fallback).not.toHaveProperty('timetableItems')
      expect(lectures.getTakenLecturesBySemester).toHaveBeenCalledWith(43, 2026, 3)
    })

    it('does not read any timetable for an unowned friendship', async () => {
      friends.getFriend.mockResolvedValue(null)
      await expect(service.getSharedTimetable(user, 7, term, 'ko')).rejects.toBeInstanceOf(NotFoundException)
      expect(friends.getFriend).toHaveBeenCalledWith(42, 7)
      expect(timetables.getSharedTimetableForSemester).not.toHaveBeenCalled()
      expect(lectures.getTakenLecturesBySemester).not.toHaveBeenCalled()
    })

    it('returns separate lecture and custom-block arrays even when IDs match', async () => {
      timetables.getSharedTimetableForSemester.mockResolvedValue({
        timetable_timetable_lectures: [{ subject_lecture: lecture }],
        timetable_timetable_customblocks: [{ block_custom_blocks: {
          ...block,
          // A legacy edit changes the canonical parent but leaves the first child stale.
          times: [{ id: 20, ...first, begin: 600 }, { id: 21, ...second }],
        } }],
      })
      const result = await service.getSharedTimetable(user, 7, term, 'en')
      expect(result.customBlocks).toEqual([{ ...block, times: [first, second] }])
      expect(result.lectures).toEqual([expect.objectContaining({ id: 10, name: 'Lecture' })])
      expect(result).not.toHaveProperty('timetableItems')
      expect(timetables.getSharedTimetableForSemester).toHaveBeenCalledWith(43, 2026, 3)
    })

    it('normalizes legacy custom blocks without child times and handles an empty saved timetable', async () => {
      timetables.getSharedTimetableForSemester.mockResolvedValue({
        timetable_timetable_lectures: [],
        timetable_timetable_customblocks: [{ block_custom_blocks: { ...block, times: [] } }],
      })
      await expect(service.getSharedTimetable(user, 7, term, 'ko')).resolves.toMatchObject({
        lectures: [], customBlocks: [{ ...block, times: [first] }],
      })
      timetables.getSharedTimetableForSemester.mockResolvedValue({
        timetable_timetable_lectures: [], timetable_timetable_customblocks: [],
      })
      await expect(service.getSharedTimetable(user, 7, term, 'ko')).resolves.toMatchObject({
        source: 'saved', lectures: [], customBlocks: [],
      })
    })
  })

  it('matches exact lectures or another semester of the same course regardless of professor', async () => {
    const lecture = {
      id: 10,
      course_id: 100,
      title: '자료구조',
      title_en: 'Data Structures',
      year: 2026,
      semester: 3,
      subject_lecture_professors: [{ professor_id: 5 }],
    }
    const otherSection = { ...lecture, id: 11 }
    const priorTerm = { ...lecture, id: 12, year: 2025 }
    const otherProfessor = { ...priorTerm, id: 13, title: '자료구조 개론', title_en: 'Introduction to Data Structures', subject_lecture_professors: [{ professor_id: 6 }] }
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
      withLectures(12, [lecture], [[otherSection]]),
      withLectures(13, [{ ...lecture, id: 14, year: 2027 }]),
      withLectures(14, [{ ...priorTerm, subject_lecture_professors: [] }]),
      withLectures(15, [otherSection]),
    ])
    const result = await service.getOverlaps(user, 10)
    expect(friends.getFriendsWithCourse).toHaveBeenCalledWith(42, 100)
    expect(result.sameLecture.map(({ id }) => id)).toEqual([1, 5, 8])
    expect(result.sameCourseOtherSemester.map(({ id }) => id)).toEqual([2, 3, 4, 6, 7, 9, 11, 13, 14])
    expect(result.sameLecture.map(({ timetable }) => timetable)).toEqual([
      { id: null, year: 2026, semester: 3 },
      { id: 501, year: 2026, semester: 3 },
      { id: 800, year: 2026, semester: 3 },
    ])
    expect(result.sameCourseOtherSemester.map(({ timetable }) => timetable)).toEqual([
      { id: null, year: 2025, semester: 3 },
      { id: null, year: 2025, semester: 3 },
      { id: null, year: 2025, semester: 3 },
      { id: 601, year: 2025, semester: 3 },
      { id: 700, year: 2025, semester: 3 },
      { id: null, year: 2025, semester: 3 },
      { id: 1100, year: 2025, semester: 3 },
      { id: null, year: 2027, semester: 3 },
      { id: null, year: 2025, semester: 3 },
    ])
  })

  it.each([2025, 2026])('does not expose enrollment hidden by an empty shared timetable in %i', async (year) => {
    const lecture = { id: 10, course_id: 100, title: '자료구조', title_en: 'Data Structures', year: 2026, semester: 3 }
    lectures.getLectureDetailById.mockResolvedValue(lecture)
    friends.getFriendsWithCourse.mockResolvedValue([{
      id: 7,
      is_favorite: false,
      friend_profile: {
        first_name: 'Test',
        last_name: 'Friend',
        taken_lectures: [{ lecture: { ...lecture, id: year === 2026 ? 10 : 11, year } }],
        timetable_timetable: [{ id: 99, year, semester: 3, timetable_timetable_lectures: [] }],
      },
    }])
    await expect(service.getOverlaps(user, 10)).resolves.toEqual({ sameLecture: [], sameCourseOtherSemester: [] })
  })

  it('chooses the latest shared matching term and ignores official records', async () => {
    const lecture = {
      id: 10,
      course_id: 100,
      title: '자료구조',
      title_en: 'Data Structures',
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
      sameCourseOtherSemester: [{
        id: 7,
        name: 'Test Friend',
        isFavorite: true,
        timetable: { id: 20, year: 2025, semester: 3 },
      }],
    })

    profile.taken_lectures.push({ lecture: priorLecture })
    profile.timetable_timetable.reverse()
    await expect(service.getOverlaps(user, 10)).resolves.toMatchObject({
      sameCourseOtherSemester: [{ timetable: { id: 20, year: 2025, semester: 3 } }],
    })

    profile.timetable_timetable.push({
      id: 99,
      year: 2026,
      semester: 1,
      timetable_timetable_lectures: [{ subject_lecture: { ...priorLecture, year: 2026, semester: 1 } }],
    })
    await expect(service.getOverlaps(user, 10)).resolves.toMatchObject({
      sameCourseOtherSemester: [{ timetable: { id: 99, year: 2026, semester: 1 } }],
    })
  })

  it('uses the matched lecture term for legacy saved timetables without a year or semester', async () => {
    const lecture = {
      id: 10,
      course_id: 100,
      title: '자료구조',
      title_en: 'Data Structures',
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
      sameCourseOtherSemester: [],
    })
  })

  describe('special-topic overlaps', () => {
    const lecture = {
      id: 10,
      course_id: 100,
      year: 2026,
      semester: 3,
      title: '전산학특강<AI 프로토타이핑>',
      title_en: 'Special Topics in Computer Science<AI Prototyping>',
      subject_lecture_professors: [{ professor_id: 5 }],
    }
    const prior = { ...lecture, id: 11, year: 2025, subject_lecture_professors: [{ professor_id: 6 }] }
    const saved = (item: typeof lecture) => ({
      id: item.id * 100,
      year: item.year,
      semester: item.semester,
      timetable_timetable_lectures: [{ subject_lecture: item }],
    })
    const friend = (taken: (typeof lecture)[], shared: ReturnType<typeof saved>[] = []) => ({
      id: 7,
      is_favorite: false,
      friend_profile: {
        first_name: 'Test',
        last_name: 'Friend',
        taken_lectures: taken.map((item) => ({ lecture: item })),
        timetable_timetable: shared,
      },
    })

    it.each([
      ['same topic with another professor', {}, {}, true],
      ['whitespace and letter case differences', {}, { title: ' 전산학 특강 < ai\t프로토타이핑 > ' }, true],
      ['full-width title characters', {}, { title: '전산학특강＜ＡＩ 프로토타이핑＞' }, true],
      ['different topic despite the same English title', {}, { title: '전산학특강<시스템 설계>' }, false],
      ['English-only Special Topics', { title: '' }, { title: '  ', title_en: 'special topics in computer science<ai prototyping>' }, true],
      ['English Special Lectures detection with a Korean title', { title: '컴퓨터과학[AI]', title_en: 'Special Lectures[AI]' }, { title: '컴퓨터과학[AI]', title_en: 'Special Lectures[AI]' }, true],
      ['different English Special Lectures topic', { title: '', title_en: 'Special Lectures[AI]' }, { title: '', title_en: 'Special Lectures[Systems]' }, false],
      ['English special-topic detection with repeated spaces', { title: '', title_en: 'Special  Topics [AI]' }, { title: '', title_en: 'Special Topics [Systems]' }, false],
      ['generic Korean title without a topic', { title: '전산학특강' }, { title: '전산학특강' }, false],
      ['generic English title without a topic', { title: '', title_en: 'Special Topics' }, { title: '', title_en: 'Special Topics' }, false],
      ['empty angle-bracket topic', { title: '전산학특강<>' }, { title: '전산학특강<>' }, false],
      ['blank square-bracket topic', { title: '전산학특강[ \t ]' }, { title: '전산학특강[ \t ]' }, false],
      ['candidate without either title', {}, { title: '', title_en: '' }, false],
      ['candidate with only a generic topic title', {}, { title: '전산학특강' }, false],
    ] as const)('%s applies to shared selections and enrolled fallbacks', async (_label, selectedTitles, candidateTitles, matches) => {
      const selected = { ...lecture, ...selectedTitles }
      const candidate = { ...prior, ...candidateTitles }
      lectures.getLectureDetailById.mockResolvedValue(selected)
      for (const shared of [false, true]) {
        friends.getFriendsWithCourse.mockResolvedValue([
          shared ? friend([], [saved(candidate)]) : friend([candidate]),
        ])
        const result = await service.getOverlaps(user, selected.id)
        expect(result.sameLecture).toEqual([])
        expect(result.sameCourseOtherSemester.map(({ id, timetable }) => ({ id, timetable }))).toEqual(matches
          ? [{ id: 7, timetable: { id: shared ? 1100 : null, year: 2025, semester: 3 } }]
          : [])
      }
      expect(friends.getFriendsWithCourse).toHaveBeenCalledWith(42, 100)
    })

    it.each(['전산학특강', '전산학특강<>'])('keeps exact lecture matching for %s without topic information', async (title) => {
      const selected = { ...lecture, title }
      lectures.getLectureDetailById.mockResolvedValue(selected)
      friends.getFriendsWithCourse.mockResolvedValue([friend([selected, { ...prior, title }])])
      await expect(service.getOverlaps(user, selected.id)).resolves.toMatchObject({
        sameLecture: [{ id: 7, timetable: { id: null, year: 2026, semester: 3 } }],
        sameCourseOtherSemester: [],
      })
    })

    it('selects the latest matching topic across shared timetables and fallback terms, skipping newer different topics', async () => {
      const latestWrongTopic = { ...prior, id: 12, year: 2026, semester: 1, title: '전산학특강<시스템 설계>' }
      const olderSameTopic = { ...prior, id: 13, year: 2024 }
      lectures.getLectureDetailById.mockResolvedValue(lecture)
      friends.getFriendsWithCourse.mockResolvedValue([
        friend([olderSameTopic], [saved(latestWrongTopic), saved(prior)]),
      ])
      await expect(service.getOverlaps(user, lecture.id)).resolves.toMatchObject({
        sameCourseOtherSemester: [{ id: 7, timetable: { id: 1100, year: 2025, semester: 3 } }],
      })
      friends.getFriendsWithCourse.mockResolvedValue([
        friend([prior], [saved(olderSameTopic), saved(latestWrongTopic)]),
      ])
      await expect(service.getOverlaps(user, lecture.id)).resolves.toMatchObject({
        sameCourseOtherSemester: [{ id: 7, timetable: { id: null, year: 2025, semester: 3 } }],
      })
    })

    it('does not reveal a matching enrolled topic when that semester shares a different topic', async () => {
      lectures.getLectureDetailById.mockResolvedValue(lecture)
      friends.getFriendsWithCourse.mockResolvedValue([
        friend([prior], [saved({ ...prior, id: 12, title: '전산학특강<시스템 설계>' })]),
      ])
      await expect(service.getOverlaps(user, lecture.id)).resolves.toEqual({
        sameLecture: [], sameCourseOtherSemester: [],
      })
    })

    it.each(['한국어 교육<특강>', '한국어 교육＜특강＞'])('keeps %s a regular course when only its subtitle mentions 특강', async (title) => {
      lectures.getLectureDetailById.mockResolvedValue({
        ...lecture, title, title_en: 'Korean Language Education<Special Topics>',
      })
      friends.getFriendsWithCourse.mockResolvedValue([
        friend([{ ...prior, title: '한국어 교육', title_en: 'Korean Language Education' }]),
      ])
      await expect(service.getOverlaps(user, lecture.id)).resolves.toMatchObject({
        sameCourseOtherSemester: [{ id: 7, timetable: { id: null, year: 2025, semester: 3 } }],
      })
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
              { taken_lectures: { some: { lecture: { course_id: 100, deleted: false } } } },
              {
                timetable_timetable: {
                  some: { is_shared: true, timetable_timetable_lectures: { some: { subject_lecture: { course_id: 100 } } } },
                },
              },
            ],
          },
        },
      }),
    )
    expect(findMany.mock.calls[0][0].select.friend_profile.select).toHaveProperty('taken_lectures')
    const savedTimetables = findMany.mock.calls[0][0].select.friend_profile.select.timetable_timetable
    expect(savedTimetables.select).toMatchObject({ id: true, year: true, semester: true })
    expect(savedTimetables.where).toEqual({ is_shared: true })
    expect(savedTimetables.select.timetable_timetable_lectures.where).toEqual({
      subject_lecture: { course_id: 100 },
    })
    expect(savedTimetables.select.timetable_timetable_lectures.select.subject_lecture.select)
      .not.toHaveProperty('subject_lecture_professors')
    expect(savedTimetables.select.timetable_timetable_lectures.select.subject_lecture.select)
      .toMatchObject({ title: true, title_en: true })
    expect(findMany.mock.calls[0][0].select.friend_profile.select.taken_lectures.select.lecture.select)
      .toMatchObject({ title: true, title_en: true })
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
