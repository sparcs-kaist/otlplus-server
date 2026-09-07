import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Transactional } from '@nestjs-cls/transactional'
import { Language } from '@otl/server-nest/common/decorators/get-language.decorator'
import { IFriendV2, ITimetableV2 } from '@otl/server-nest/common/interfaces/v2'
import {
  toJsonLectures,
  toJsonTimetableV2,
  toJsonTimetableV2WithLectures,
} from '@otl/server-nest/common/serializer/v2/timetable.serializer'
import settings from '@otl/server-nest/settings'
import { session_userprofile } from '@prisma/client'
import { randomUUID } from 'node:crypto'

import { EFriend } from '@otl/prisma-client/entities'
import {
  FriendRepository,
  LectureRepository,
  TimetableRepository,
  UserRepository,
} from '@otl/prisma-client/repositories'

interface FriendInvitePayload {
  sub: string
  type: 'friend-invite'
}

@Injectable()
export class FriendsService {
  private readonly inviteConfig = settings().getFriendInviteConfig()

  constructor(
    private readonly friendRepository: FriendRepository,
    private readonly lectureRepository: LectureRepository,
    private readonly timetableRepository: TimetableRepository,
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async getFriends(user: session_userprofile): Promise<IFriendV2.GetFriendsResDto> {
    return { friends: (await this.friendRepository.getFriends(user.id)).map(this.toFriend) }
  }

  async createInvite(user: session_userprofile): Promise<IFriendV2.CreateInviteResDto> {
    const token = await this.jwtService.signAsync(
      { type: 'friend-invite' },
      {
        secret: this.inviteConfig.secret,
        algorithm: 'HS256',
        audience: this.inviteConfig.audience,
        expiresIn: this.inviteConfig.expiresIn,
        subject: String(user.id),
        jwtid: randomUUID(),
      },
    )
    return { token, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }
  }

  @Transactional()
  async acceptInvite(user: session_userprofile, token: string): Promise<IFriendV2.AcceptInviteResDto> {
    let payload: FriendInvitePayload
    try {
      payload = await this.jwtService.verifyAsync<FriendInvitePayload>(token, {
        secret: this.inviteConfig.secret,
        algorithms: ['HS256'],
        audience: this.inviteConfig.audience,
      })
    }
    catch {
      throw new BadRequestException('Invalid or expired friend invite')
    }

    const inviterId = Number(payload.sub)
    if (payload.type !== 'friend-invite' || !Number.isSafeInteger(inviterId) || inviterId <= 0) {
      throw new BadRequestException('Invalid friend invite')
    }
    if (inviterId === user.id) throw new BadRequestException('You cannot add yourself as a friend')
    if (!(await this.userRepository.findById(inviterId))) {
      throw new BadRequestException('Friend invite owner no longer exists')
    }

    await this.friendRepository.createPair(user.id, inviterId)
    const friend = await this.friendRepository.getFriendByTarget(user.id, inviterId)
    if (!friend) throw new BadRequestException('Failed to add friend')
    return { friend: this.toFriend(friend) }
  }

  @Transactional()
  async updateFavorite(
    user: session_userprofile,
    friendId: number,
    isFavorite: boolean,
  ): Promise<IFriendV2.UpdateFavoriteResDto> {
    await this.getFriend(user.id, friendId)
    await this.friendRepository.setFavorite(user.id, friendId, isFavorite)
    return { id: friendId, isFavorite }
  }

  @Transactional()
  async deleteFriend(user: session_userprofile, friendId: number): Promise<IFriendV2.DeleteFriendResDto> {
    const friend = await this.getFriend(user.id, friendId)
    await this.friendRepository.deletePair(user.id, friend.friend_userprofile_id)
    return { id: friendId }
  }

  async getTimetables(
    user: session_userprofile,
    friendId: number,
    query: ITimetableV2.GetTimetablesReqDto,
  ): Promise<IFriendV2.GetTimetablesResDto> {
    const friend = await this.getFriend(user.id, friendId)
    const timetables = await this.timetableRepository.getTimetablesByUserId(
      friend.friend_userprofile_id,
      query.year,
      query.semester,
    )
    return { timetables: timetables.map(toJsonTimetableV2) }
  }

  async getMyTimetable(
    user: session_userprofile,
    friendId: number,
    query: ITimetableV2.MyTimetableReqDto,
    language: Language,
  ): Promise<ITimetableV2.MyTimetableResDto> {
    const friend = await this.getFriend(user.id, friendId)
    const lectures = await this.lectureRepository.getTakenLecturesBySemester(
      friend.friend_userprofile_id,
      query.year,
      query.semester,
    )
    return toJsonLectures(lectures, language)
  }

  async getTimetable(
    user: session_userprofile,
    friendId: number,
    timetableId: number,
    language: Language,
  ): Promise<ITimetableV2.GetResDto> {
    const friend = await this.getFriend(user.id, friendId)
    const timetable = await this.timetableRepository.getTimeTableByIdAndUserId(
      timetableId,
      friend.friend_userprofile_id,
    )
    if (!timetable) throw new NotFoundException('Timetable not found')
    return toJsonTimetableV2WithLectures(timetable, language)
  }

  async getOverlaps(user: session_userprofile, lectureId: number): Promise<IFriendV2.GetOverlapsResDto> {
    const lecture = await this.lectureRepository.getLectureDetailById(lectureId)
    if (!lecture) throw new NotFoundException('Lecture not found')

    const professorIds = new Set(lecture.subject_lecture_professors.map(({ professor_id }) => professor_id))
    const friends = await this.friendRepository.getFriendsWithTakenCourse(user.id, lecture.course_id)
    const result: IFriendV2.GetOverlapsResDto = {
      sameLecture: [],
      sameCourseDifferentSection: [],
      previousSemesterSameProfessor: [],
    }

    for (const friend of friends) {
      const taken = friend.friend_profile.taken_lectures.map(({ lecture: takenLecture }) => takenLecture)
      const serialized = this.toFriend(friend)
      if (taken.some(({ id }) => id === lecture.id)) {
        result.sameLecture.push(serialized)
      }
      else if (taken.some(({ year, semester }) => year === lecture.year && semester === lecture.semester)) {
        result.sameCourseDifferentSection.push(serialized)
      }
      else if (
        taken.some(
          (takenLecture) => (takenLecture.year !== lecture.year || takenLecture.semester !== lecture.semester)
            && takenLecture.subject_lecture_professors.some(({ professor_id }) => professorIds.has(professor_id)),
        )
      ) {
        result.previousSemesterSameProfessor.push(serialized)
      }
    }
    return result
  }

  private async getFriend(userId: number, friendId: number): Promise<EFriend.Summary> {
    const friend = await this.friendRepository.getFriend(userId, friendId)
    if (!friend) throw new NotFoundException('Friend not found')
    return friend
  }

  private readonly toFriend = (friend: EFriend.Summary | EFriend.WithTakenLectures): IFriendV2.Friend => ({
    id: friend.id,
    name: [friend.friend_profile.first_name, friend.friend_profile.last_name].filter(Boolean).join(' '),
    isFavorite: friend.is_favorite,
  })
}
