import { TimeTableColorEnum } from '@otl/common/enum/color'
import { TimeBlock } from '@otl/common/enum/time'

export namespace IPersonal {
  export interface Block {
    id: number
    year: number
    semester: number
    user_id: number // (userProfileId)
    timetable_id: number | null // timetable.id 로, null이면 기본시간표
    title: string
    timeBlock: TimeBlock[]
    place: string | null // 장소
    description: string | null // 설명
    color: TimeTableColorEnum
  }
}
