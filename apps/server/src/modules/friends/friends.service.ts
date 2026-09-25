import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Transactional } from '@nestjs-cls/transactional'
import { Language } from '@otl/server-nest/common/decorators/get-language.decorator'
import { IFriendV2, ITimetableV2 } from '@otl/server-nest/common/interfaces/v2'
import {
  toJsonLectures,
  toJsonTimetableV2,
  toJsonTimetableV2WithItems,
} from '@otl/server-nest/common/serializer/v2/timetable.serializer'
import { session_userprofile } from '@prisma/client'

import { TimetableItemKind } from '@otl/common/enum/timetable'

import { EFriend } from '@otl/prisma-client/entities'
import {
  FriendRepository,
  LectureRepository,
  SemesterRepository,
  TimetableRepository,
} from '@otl/prisma-client/repositories'

@Injectable()
export class FriendsService {
  constructor(
    private readonly friendRepository: FriendRepository,
    private readonly lectureRepository: LectureRepository,
    private readonly timetableRepository: TimetableRepository,
    private readonly semesterRepository: SemesterRepository,
  ) {}

  async getFriends(user: session_userprofile): Promise<IFriendV2.GetFriendsResDto> {
    const now = new Date()
    const friends = await this.friendRepository.getFriends(user.id)
    if (friends.length === 0) return { checkedAt: now.toISOString(), friends: [] }

    const semesters = await this.semesterRepository.getActiveSemestersAt(now)
    const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000)
    const day = (koreaTime.getUTCDay() + 6) % 7
    const minute = koreaTime.getUTCHours() * 60 + koreaTime.getUTCMinutes()
    const scheduledFriendIds = new Set(semesters.length === 0
      ? []
      : await this.friendRepository.getFriendIdsWithScheduleAt(
        user.id,
        friends.map(({ id }) => id),
        semesters,
        day,
        minute,
      ))
    return {
      checkedAt: now.toISOString(),
      friends: friends.map((friend) => ({
        ...this.toFriend(friend),
        hasScheduleNow: semesters.length === 0 ? null : scheduledFriendIds.has(friend.id),
      })),
    }
  }

  async getCode(user: session_userprofile): Promise<IFriendV2.GetCodeResDto> {
    return { code: await this.friendRepository.getOrCreateCode(user.id) }
  }

  @Transactional()
  async addFriend(user: session_userprofile, code: string): Promise<IFriendV2.AddFriendResDto> {
    const inviterId = await this.friendRepository.getUserIdByCode(code)
    if (inviterId === null) throw new BadRequestException('Invalid friend code')
    if (inviterId === user.id) {
      throw new BadRequestException({
        code: 'SELF_FRIENDSHIP',
        message: 'You cannot add yourself as a friend',
      })
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
    const serialized = toJsonLectures(lectures, language).lectures
    return { lectures: serialized, timetableItems: serialized.map((data) => ({ kind: TimetableItemKind.LECTURE, data })) }
  }

  async getTimetable(
    user: session_userprofile,
    friendId: number,
    timetableId: number,
    language: Language,
  ): Promise<ITimetableV2.TimetableDetailResDto> {
    const friend = await this.getFriend(user.id, friendId)
    const timetable = await this.timetableRepository.getTimeTableWithItemsByIdAndUserId(
      timetableId,
      friend.friend_userprofile_id,
    )
    if (!timetable) throw new NotFoundException('Timetable not found')
    return toJsonTimetableV2WithItems(timetable, language)
  }

  async getOverlaps(user: session_userprofile, lectureId: number): Promise<IFriendV2.GetOverlapsResDto> {
    const lecture = await this.lectureRepository.getLectureDetailById(lectureId)
    if (!lecture) throw new NotFoundException('Lecture not found')

    const professorIds = new Set(lecture.subject_lecture_professors.map(({ professor_id }) => professor_id))
    const friends = await this.friendRepository.getFriendsWithCourse(user.id, lecture.course_id)
    const result: IFriendV2.GetOverlapsResDto = {
      sameLecture: [],
      sameCourseDifferentSection: [],
      previousSemesterSameProfessor: [],
    }

    for (const friend of friends) {
      const profile = friend.friend_profile
      const matchingLectures = [
        ...profile.taken_lectures.map(({ lecture: takenLecture }) => ({
          lecture: takenLecture,
          timetable: { id: null, year: takenLecture.year, semester: takenLecture.semester },
        })),
        ...profile.timetable_timetable.flatMap((timetable) => timetable.timetable_timetable_lectures.map(({ subject_lecture: savedLecture }) => ({
          lecture: savedLecture,
          timetable: {
            id: timetable.id,
            year: timetable.year ?? savedLecture.year,
            semester: timetable.semester ?? savedLecture.semester,
          },
        }))),
      ].sort((a, b) => b.timetable.year - a.timetable.year
        || b.timetable.semester - a.timetable.semester
        || (a.timetable.id ?? 0) - (b.timetable.id ?? 0))
      const serialized = this.toFriend(friend)
      const sameLecture = matchingLectures.find(({ lecture: item }) => item.id === lecture.id)
      const sameTerm = matchingLectures.find(({ lecture: item }) => item.year === lecture.year && item.semester === lecture.semester)
      const otherTerm = matchingLectures.find(({ lecture: item }) => (item.year !== lecture.year || item.semester !== lecture.semester)
        && item.subject_lecture_professors.some(({ professor_id }) => professorIds.has(professor_id)))
      if (sameLecture) {
        result.sameLecture.push({ ...serialized, timetable: sameLecture.timetable })
      }
      else if (sameTerm) {
        result.sameCourseDifferentSection.push({ ...serialized, timetable: sameTerm.timetable })
      }
      else if (otherTerm) {
        result.previousSemesterSameProfessor.push({ ...serialized, timetable: otherTerm.timetable })
      }
    }
    return result
  }

  private async getFriend(userId: number, friendId: number): Promise<EFriend.Summary> {
    const friend = await this.friendRepository.getFriend(userId, friendId)
    if (!friend) throw new NotFoundException('Friend not found')
    return friend
  }

  private readonly toFriend = (friend: EFriend.Summary): IFriendV2.Friend => ({
    id: friend.id,
    name: [friend.friend_profile.first_name, friend.friend_profile.last_name].filter(Boolean).join(' '),
    isFavorite: friend.is_favorite,
  })
}
