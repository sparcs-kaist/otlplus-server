import { NotFoundException, ValidationPipe } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { TransactionHost } from '@nestjs-cls/transactional'
import { IFriendV2 } from '@otl/server-nest/common/interfaces/v2'
import settings from '@otl/server-nest/settings'
import { session_userprofile } from '@prisma/client'

import { EFriend } from '@otl/prisma-client/entities'
import {
  FriendRepository,
  LectureRepository,
  TimetableRepository,
  UserRepository,
} from '@otl/prisma-client/repositories'

import { FriendsService } from './friends.service'

describe('FriendsService', () => {
  const user = { id: 42 } as session_userprofile
  const jwtService = new JwtService()
  const friends = {
    getFriend: jest.fn(),
    getFriendsWithTakenCourse: jest.fn(),
    createPair: jest.fn(),
    getFriendByTarget: jest.fn(),
  }
  const lectures = { getLectureDetailById: jest.fn() }
  const timetables = { getTimeTableByIdAndUserId: jest.fn() }
  const users = { findById: jest.fn() }
  let service: FriendsService
  const previousSecret = process.env.FRIEND_INVITE_SECRET

  beforeEach(async () => {
    jest.resetAllMocks()
    process.env.FRIEND_INVITE_SECRET = 'test-friend-invite-secret-with-enough-entropy'
    const module = await Test.createTestingModule({
      providers: [
        FriendsService,
        { provide: FriendRepository, useValue: friends },
        { provide: LectureRepository, useValue: lectures },
        { provide: TimetableRepository, useValue: timetables },
        { provide: UserRepository, useValue: users },
        { provide: JwtService, useValue: jwtService },
        {
          provide: TransactionHost,
          useValue: { withTransaction: (_propagation: unknown, _options: unknown, work: () => unknown) => work() },
        },
      ],
    }).compile()
    service = module.get(FriendsService)
  })

  afterAll(() => {
    if (previousSecret === undefined) delete process.env.FRIEND_INVITE_SECRET
    else process.env.FRIEND_INVITE_SECRET = previousSecret
  })

  it('rejects tampered, expired, wrong-purpose and self invites before creating a friendship', async () => {
    const { token } = await service.createInvite(user)
    const payload = await jwtService.verifyAsync(token, {
      secret: process.env.FRIEND_INVITE_SECRET,
      algorithms: ['HS256'],
      audience: 'otl-web',
    })

    expect(payload).toMatchObject({ sub: '42', type: 'friend-invite', aud: 'otl-web' })
    expect(payload.exp - payload.iat).toBe(7 * 24 * 60 * 60)
    const [header, body, signature] = token.split('.')
    const tampered = `${header}.${body}.${signature[0] === 'A' ? 'B' : 'A'}${signature.slice(1)}`
    const invalidTokens = [
      tampered,
      await jwtService.signAsync(
        { type: 'friend-invite', sub: '43' },
        {
          secret: process.env.FRIEND_INVITE_SECRET,
          expiresIn: -1,
          audience: 'otl-web',
        },
      ),
      await jwtService.signAsync(
        { type: 'access', sub: '43' },
        {
          secret: process.env.FRIEND_INVITE_SECRET,
          audience: 'otl-web',
        },
      ),
      await jwtService.signAsync(
        { type: 'friend-invite', sub: '43' },
        {
          secret: process.env.FRIEND_INVITE_SECRET,
          audience: 'another-app',
        },
      ),
      token,
    ]
    for (const invalidToken of invalidTokens) {
      await expect(service.acceptInvite(user, invalidToken)).rejects.toMatchObject({ status: 400 })
    }
    expect(friends.createPair).not.toHaveBeenCalled()
  })

  it('requires a separate invite signing key instead of accepting the auth key', () => {
    delete process.env.FRIEND_INVITE_SECRET
    expect(() => settings().getFriendInviteConfig()).toThrow('FRIEND_INVITE_SECRET')
    const previousJwtSecret = process.env.JWT_SECRET
    process.env.FRIEND_INVITE_SECRET = 'same-key-for-auth-and-invite-is-not-allowed'
    process.env.JWT_SECRET = process.env.FRIEND_INVITE_SECRET
    expect(() => settings().getFriendInviteConfig()).toThrow('different from JWT_SECRET')
    if (previousJwtSecret === undefined) delete process.env.JWT_SECRET
    else process.env.JWT_SECRET = previousJwtSecret
  })

  it('creates both directions through the pair operation and returns the caller-owned relation', async () => {
    const { token } = await service.createInvite({ id: 43 } as session_userprofile)
    users.findById.mockResolvedValue({ id: 43 })
    friends.getFriendByTarget.mockResolvedValue({
      id: 100,
      is_favorite: false,
      friend_profile: { first_name: 'Test', last_name: 'Friend' },
    })
    await expect(service.acceptInvite(user, token)).resolves.toEqual({
      friend: { id: 100, name: 'Test Friend', isFavorite: false },
    })
    expect(friends.createPair).toHaveBeenCalledWith(42, 43)
    expect(friends.getFriendByTarget).toHaveBeenCalledWith(42, 43)
  })

  it('requires an owned friendship and scopes the timetable to that friend', async () => {
    friends.getFriend.mockResolvedValue(null)
    await expect(service.getTimetable(user, 7, 99, 'ko')).rejects.toBeInstanceOf(NotFoundException)
    expect(friends.getFriend).toHaveBeenCalledWith(42, 7)
    expect(timetables.getTimeTableByIdAndUserId).not.toHaveBeenCalled()

    friends.getFriend.mockResolvedValue({ friend_userprofile_id: 43 })
    timetables.getTimeTableByIdAndUserId.mockResolvedValue(null)
    await expect(service.getTimetable(user, 7, 99, 'ko')).rejects.toBeInstanceOf(NotFoundException)
    expect(timetables.getTimeTableByIdAndUserId).toHaveBeenCalledWith(99, 43)
  })

  it('groups each friend only once with exact-section matches taking priority', async () => {
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
    const withLectures = (id: number, taken: (typeof lecture)[]) => ({
      id,
      is_favorite: false,
      friend_profile: {
        first_name: `Friend ${id}`,
        last_name: '',
        taken_lectures: taken.map((item) => ({ lecture: item })),
      },
    })
    lectures.getLectureDetailById.mockResolvedValue(lecture)
    friends.getFriendsWithTakenCourse.mockResolvedValue([
      withLectures(1, [lecture, otherSection, priorTerm]),
      withLectures(2, [otherSection, priorTerm]),
      withLectures(3, [priorTerm]),
      withLectures(4, [otherProfessor]),
    ])
    const result = await service.getOverlaps(user, 10)
    expect(friends.getFriendsWithTakenCourse).toHaveBeenCalledWith(42, 100)
    expect(result.sameLecture.map(({ id }) => id)).toEqual([1])
    expect(result.sameCourseDifferentSection.map(({ id }) => id)).toEqual([2])
    expect(result.previousSemesterSameProfessor.map(({ id }) => id)).toEqual([3])
  })

  it('filters included lecture rows by course, not just the parent friend records', async () => {
    const findMany = jest.fn().mockResolvedValue([])
    const repository = new FriendRepository({ tx: { session_userprofile_friends: { findMany } } } as never)
    await repository.getFriendsWithTakenCourse(42, 100)
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        ...EFriend.WithTakenLectures(100),
        where: {
          userprofile_id: 42,
          friend_profile: { taken_lectures: { some: { lecture: { course_id: 100 } } } },
        },
      }),
    )
    expect(findMany.mock.calls[0][0].select.friend_profile.select.taken_lectures.where).toEqual({
      lecture: { course_id: 100 },
    })
  })

  it('preserves JSON false and rejects string booleans', async () => {
    const pipe = new ValidationPipe({ whitelist: true, transform: true })
    const metadata = { type: 'body' as const, metatype: IFriendV2.UpdateFavoriteReqDto }
    await expect(pipe.transform({ isFavorite: false }, metadata)).resolves.toMatchObject({ isFavorite: false })
    await expect(pipe.transform({ isFavorite: 'false' }, metadata)).rejects.toMatchObject({ status: 400 })
  })
})
