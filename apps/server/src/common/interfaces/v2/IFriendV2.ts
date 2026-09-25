import { Transform } from 'class-transformer'
import { IsBoolean, IsString, Matches } from 'class-validator'

import { ITimetableV2 } from './ITimetableV2'

export namespace IFriendV2 {
  export interface Friend {
    id: number
    name: string
    isFavorite: boolean
  }

  export interface GetFriendsResDto {
    friends: Friend[]
  }

  export interface GetCodeResDto {
    code: string
  }

  export interface AddFriendResDto {
    friend: Friend
  }

  export class AddFriendReqDto {
    @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
    @IsString()
    @Matches(/^[ACDEFHJKLMNPQRTUVWXY3479]{6}$/)
    code!: string
  }

  export class UpdateFavoriteReqDto {
    @IsBoolean()
    isFavorite!: boolean
  }

  export interface UpdateFavoriteResDto {
    id: number
    isFavorite: boolean
  }

  export interface DeleteFriendResDto {
    id: number
  }

  export interface GetTimetablesResDto {
    timetables: ITimetableV2.TimetableItem[]
  }

  export interface OverlapFriend extends Friend {
    timetable: {
      /** null identifies the official academic timetable for this term. */
      id: number | null
      year: number
      semester: number
    }
  }

  export interface GetOverlapsResDto {
    sameLecture: OverlapFriend[]
    sameCourseDifferentSection: OverlapFriend[]
    previousSemesterSameProfessor: OverlapFriend[]
  }
}
