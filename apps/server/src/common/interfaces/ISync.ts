import { Transform, Type } from 'class-transformer'
import {
  IsIn, IsInt, IsNumber, IsOptional, IsString, ValidateNested,
} from 'class-validator'

export namespace ISync {
  /** 동기화 대상 강의 정보
  example:
      {
      "lecture_year": 2024,
      "lecture_term": 3,
      "subject_no": "36.492",
      "lecture_class": "F ",
      "dept_id": 4421,
      "dept_name": "전산학부",
      "e_dept_name": "School of Computing",
      "sub_title": "전산학특강<AI 프로토타이핑>",
      "e_sub_title": "Special Topics in Computer Science<AI Prototyping>",
      "subject_id": 34,
      "subject_type": "전공선택",
      "e_subject_type": "Major Elective",
      "course_sect": 7,
      "act_unit": 0,
      "lecture": 3,
      "lab": 0,
      "credit": 3,
      "limit": 25,
      "prof_names": "안드리아",
      "notice": "",
      "old_no": "CS492",
      "english_lec": "Y",
      "e_prof_names": "Bianchi Andrea"
    },
  */
  export class ScholarLectureType {
    /** 개설 연도 */
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    LECTURE_YEAR!: number

    /** 개설 학기. 1: 봄학기, 2:여름학기, 3: 가을학기, 4: 겨울학기 */
    @Transform(({ value }) => parseInt(value))
    @IsIn([1, 2, 3, 4])
    LECTURE_TERM!: number

    /** 36.492 등의 과목코드 */
    @IsString()
    SUBJECT_NO!: string

    /** 분반 */
    @IsString()
    LECTURE_CLASS!: string

    /** 학과 숫자 id */
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    DEPT_ID!: number

    /** 학과 이름 */
    @IsString()
    DEPT_NAME!: string

    /** 학과 영어 이름 */
    @IsString()
    E_DEPT_NAME!: string

    /** 강의 이름, 전산학특강<AI 프로토타이핑> 처럼 꺾쇠도 사용. */
    @IsString()
    SUB_TITLE!: string

    /** 강의 영어 이름 */
    @IsString()
    E_SUB_TITLE!: string

    /** 과목 종류 id로 추정. 아래 subject_type과 대응. */
    // @Transform(({ value }) => parseInt(value))
    @IsString()
    SUBJECT_ID!: string

    /** 과목 종류 한글 명칭. 전공필수, 전공선택 등 */
    @IsString()
    SUBJECT_TYPE!: string

    /** 과목 종류 영어 명칭. Major Elective 등 */
    @IsString()
    E_SUBJECT_TYPE!: string

    /** ? 학년 구분이라고 보임. */
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    COURSE_SECT!: number

    /** 부여 AU */
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    ACT_UNIT!: number

    /** 강의시간 */
    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    LECTURE!: number

    /** 실습시간 */
    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    LAB!: number

    /** 학점 */
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    CREDIT!: number

    /** 수강 제한 인원 */
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    LIMIT!: number

    /** 교수(들) 이름 */
    @IsString()
    PROF_NAMES!: string

    /** 공지사항 */
    @IsString()
    NOTICE!: string

    /** CS492 형의 과목 코드 */
    @IsString()
    OLD_NO!: string

    /** 영어 강의 여부 */
    @IsIn(['Y', 'N', ''], { message: (args) => JSON.stringify(args) })
    ENGLISH_LEC!: 'Y' | 'N' | ''

    /** 교수(들) 영어 이름 */
    @IsString()
    E_PROF_NAMES!: string
  }

  /** 동기화 대상 교수 정보
  example:
  {
    "lecture_year": 2024,
    "lecture_term": 1,
    "subject_no": "21.960",
    "lecture_class": "AS",
    "dept_id": 132,
    "prof_id": 1849,
    "prof_name": "전상용",
    "portion": 3,
    "e_prof_name": " Sangyong Jon"
  },
  */
  export class ScholarChargeType {
    /** 개설 연도 */
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    LECTURE_YEAR!: number

    /** 개설 학기. 1: 봄학기, 2:여름학기, 3: 가을학기, 4: 겨울학기 */
    @Transform(({ value }) => parseInt(value))
    @IsIn([1, 2, 3, 4])
    LECTURE_TERM!: number

    /** 36.492 등의 과목코드 */
    @IsString()
    SUBJECT_NO!: string

    /** 분반 */
    @IsString()
    LECTURE_CLASS!: string

    /** 학과 숫자 id */
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    DEPT_ID!: number

    /** 교수 숫자 id */
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    PROF_ID!: number

    /** 교수 이름 */
    @IsString()
    PROF_NAME!: string

    /** ? */
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    PORTION!: number

    // TODO: 이전 코드에 따르면 e_prof_name은 null이 가능하다고 되어 있음. 이게 맞는지 확인 필요.
    /** 교수 영어 이름 */
    @IsOptional()
    @IsString()
    E_PROF_NAME?: string | null
  }

  /** 동기화 대상 시험시간 정보
   example:
   {
      "lecture_year": 2024,
      "lecture_term": 1,
      "subject_no": "31.343",
      "lecture_class": "  ",
      "dept_id": 331,
      "exam_day": 4,
      "exam_begin": "1899-12-31 13:00:00.0",
      "exam_end": "1899-12-31 15:45:00.0",
      "notice": ""
    }
   */
  export class ExamtimeType {
    /** 개설 연도 */
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    LECTURE_YEAR!: number

    /** 개설 학기. 1: 봄학기, 2:여름학기, 3: 가을학기, 4: 겨울학기 */
    @Transform(({ value }) => parseInt(value))
    @IsIn([1, 2, 3, 4])
    LECTURE_TERM!: number

    /** 36.492 등의 과목코드 */
    @IsString()
    SUBJECT_NO!: string

    /** 분반 */
    @IsString()
    LECTURE_CLASS!: string

    /** 학과 숫자 id */
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    DEPT_ID!: number

    /** 시험 요일. 1~6 범위의 값 확인. 월부터 시작. */
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    EXAM_DAY!: number

    /** 시험 시작 시간 */
    @IsString()
    EXAM_BEGIN!: string

    /** 시험 종료 시간 */
    @IsString()
    EXAM_END!: string

    /** 공지사항 */
    @IsString()
    NOTICE!: string
  }

  /** 동기화 대상 수업시간 정보
   example:
   {
      "lecture_year": 2024,
      "lecture_term": 1,
      "subject_no": "36.204",
      "lecture_class": "A ",
      "dept_id": 4421,
      "lecture_day": 2,
      "lecture_begin": "1900-01-01 13:00:00.0",
      "lecture_end": "1900-01-01 14:30:00.0",
      "lecture_type": "l",
      "building": 304,
      "room_no": "터만홀",
      "room_k_name": "(E11)창의학습관",
      "room_e_name": "(E11)Creative Learning Bldg.",
      "teaching": 3
    }
   */

  function timeDayConverter(dayString: string) {
    const dayNumber = parseInt(dayString)
    if (dayNumber < 1 || dayNumber > 7) {
      throw new Error('Invalid day number. Must be between 1 and 7.')
    }

    const day = dayNumber === 1 ? 7 : dayNumber - 1
    return day - 1
  }

  export class ClasstimeType {
    /** 개설 연도 */
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    LECTURE_YEAR!: number

    /** 개설 학기. 1: 봄학기, 2:여름학기, 3: 가을학기, 4: 겨울학기 */
    @Transform(({ value }) => parseInt(value))
    @IsIn([1, 2, 3, 4])
    LECTURE_TERM!: number

    /** 36.492 등의 과목코드 */
    @IsString()
    SUBJECT_NO!: string

    /** 분반 */
    @IsString()
    LECTURE_CLASS!: string

    /** 학과 숫자 id */
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    DEPT_ID!: number

    /** 수업 요일. 1~7 범위의 값 확인. 월부터 시작. */
    @IsNumber()
    @Transform(({ value }) => timeDayConverter(value))
    LECTURE_DAY!: number

    /** 수업 시작 시간 */
    @IsString()
    LECTURE_BEGIN!: string

    /** 수업 종료 시간 */
    @IsString()
    LECTURE_END!: string

    /** 수업 종류. l: lecture, e: experiment */
    @Transform(({ value }) => value.toLowerCase()) // TODO: DB까지 전부 대문자로 변경?
    @IsIn(['l', 'e'])
    LECTURE_TYPE!: 'l' | 'e'

    /** 건물 번호 */
    // @Transform(({ value }) => parseInt(value))
    @IsString()
    BUILDING!: string

    /** 강의실 번호 */
    @IsString()
    ROOM_NO!: string

    /** 강의실 한글 이름 */
    @IsString()
    ROOM_K_NAME!: string

    /** 강의실 영어 이름 */
    @IsString()
    ROOM_E_NAME!: string

    /** 수업 교시 */
    @IsNumber()
    @IsOptional() // 빈 문자열이나 undefined를 허용
    @Transform(({ value }) => {
      if (value === '' || value === null || value === undefined) {
        return null // 임시로 null로 처리합니다.
      }
      const parsed = parseInt(value)
      return Number.isNaN(parsed) ? null : parsed // 숫자가 아닌 경우 null 반환
    })
    TEACHING!: number | null
  }

  /** 동기화 대상 들은 수업 정보
   example:
   {
      "lecture_year": 2024,
      "lecture_term": 1,
      "subject_no": "25.101",
      "lecture_class": "G ",
      "dept_id": 151,
      "student_no": 20240111,
      "process_type": "I"
    }
  */
  export class AttendType {
    /** 개설 연도 */
    @IsInt()
    @Transform(({ value }) => parseInt(value))
    LECTURE_YEAR!: number

    /** 개설 학기. 1: 봄학기, 2:여름학기, 3: 가을학기, 4: 겨울학기 */
    @Transform(({ value }) => parseInt(value))
    @IsIn([1, 2, 3, 4])
    LECTURE_TERM!: number

    /** 36.492 등의 과목코드 */
    @IsString()
    SUBJECT_NO!: string

    /** 분반 */
    @IsString()
    LECTURE_CLASS!: string

    /** 학과 숫자 id */
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    DEPT_ID!: number

    /** 학번 */
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    STUDENT_NO!: number

    /** 신청 기간 구분으로 유추. I: 수강신청기간 내 신청, C: 수강변경기간 내 신청 */
    @IsIn(['I', 'C'])
    PROCESS_TYPE!: 'I' | 'C'
  }

  export class ClasstimeBody {
    /** 동기화 대상 연도 */
    @IsInt()
    year!: number

    /** 동기화 대상 학기 */
    @IsIn([1, 2, 3, 4])
    semester!: number

    /** 동기화 대상 수업시간 정보 */
    @Type(() => ClasstimeType)
    @ValidateNested({ each: true })
    classtimes!: ClasstimeType[]
  }

  export class TakenLectureBody {
    /** 동기화 대상 연도 */
    @IsInt()
    year!: number

    /** 동기화 대상 학기 */
    @IsIn([1, 2, 3, 4])
    semester!: number

    /** 동기화 대상 수강 강의 정보 */
    @Type(() => AttendType)
    @ValidateNested({ each: true })
    attend!: AttendType[]
  }

  export class ExamtimeBody {
    /** 동기화 대상 연도 */
    @IsInt()
    year!: number

    /** 동기화 대상 학기 */
    @IsIn([1, 2, 3, 4])
    semester!: number

    /** 동기화 대상 시험시간 정보 */
    @Type(() => ExamtimeType)
    @ValidateNested({ each: true })
    examtimes!: ExamtimeType[]
  }

  export class ScholarDBBody {
    /** 동기화 대상 연도 */
    @IsInt()
    year!: number

    /** 동기화 대상 학기 */
    @IsIn([1, 2, 3, 4])
    semester!: number

    /** 동기화 대상 강의 정보 */
    @Type(() => ScholarLectureType)
    @ValidateNested()
    lectures!: ScholarLectureType[]

    /** 강의 강사 정보 */
    @Type(() => ScholarChargeType)
    @ValidateNested()
    charges!: ScholarChargeType[]
  }

  export class TakenLectureSyncBody {
    /** 동기화 대상 연도 */
    @IsInt()
    year!: number

    /** 동기화 대상 학기 */
    @IsIn([1, 2, 3, 4])
    semester!: number
  }

  export class TakenLectureSyncQuery {
    /** 동기화 대상 연도 */
    @IsInt()
    year!: number

    /** 동기화 대상 학기 */
    @IsIn([1, 2, 3, 4])
    semester!: number
  }
}
