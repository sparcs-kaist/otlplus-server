// TODO: waiting for lecture
// import { ILecture } from '@otl/server-nest/common/interfaces/v2/ILecture'
import { Type } from 'class-transformer'
import { IsString } from 'class-validator'

export const TIMETABLE_MAX_LIMIT = 50

export namespace ITimetableV2 {
  export class QueryDto {
    @IsString()
    @Type(() => String)
    user_id?: string
  }

  export interface Response {
    id: number
    year: number | null
    semester: number | null
    timeTableOrder: number
    userId: number
  }
}
