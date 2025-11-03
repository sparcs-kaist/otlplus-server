import { IDepartmentV2 } from './IDepartmentV2'
import { IProfessorV2 } from './IProfessorV2'

export namespace ILectureV2 {
  export interface ClassTime {
    day: number // 0-4
    begin: number // 0-3000
    end: number // 0-3000
    buildingCode: string
    placeName: string
    placeNameShort: string
  }

  export interface ExamTime {
    day: number
    str: string
    begin: number
    end: number
  }

  export interface Basic {
    id: number
    courseId: number
    classNo: string
    name: string
    code: string
    department: IDepartmentV2.Basic[]
    type: string
    limitPeople: number
    numPeople: number
    credit: number
    creditAU: number
    averageGrade: number // 0-5
    averageLoad: number // 0-5
    averageSpeech: number // 0-5
    isEnglish: boolean
    professors: IProfessorV2.Basic[]
    classes: ClassTime[]
    examTime: ExamTime | null
  }
}
