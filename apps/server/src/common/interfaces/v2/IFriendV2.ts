import {
  IsBoolean, IsString, MaxLength, MinLength,
} from 'class-validator'

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

  export interface CreateInviteResDto {
    token: string
    expiresAt: string
  }

  export interface AcceptInviteResDto {
    friend: Friend
  }

  export class AcceptInviteReqDto {
    @IsString()
    @MinLength(1)
    @MaxLength(2048)
    token!: string
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

  export interface GetOverlapsResDto {
    sameLecture: Friend[]
    sameCourseDifferentSection: Friend[]
    previousSemesterSameProfessor: Friend[]
  }
}
