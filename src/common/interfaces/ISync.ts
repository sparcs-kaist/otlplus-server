import { IsIn, IsInt, IsNumber, IsString } from 'class-validator';

export namespace ISync {
  export class ScholarDBBody {
    secret!: string;
    data!: ScholarDBData;
  }

  export class ScholarDBData {}

  /*
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
    @IsInt()
    lecture_year!: number;
    /** 개설 학기. 1: 봄학기, 2:여름학기, 3: 가을학기, 4: 겨울학기 */
    @IsIn([1, 2, 3, 4])
    lecture_term!: number;
    /** 36.492 등의 과목코드 */
    @IsString()
    subject_no!: string;
    /** 분반 */
    @IsString()
    lecture_class!: string;
    /** 학과 숫자 id */
    @IsInt()
    dept_id!: number;
    /** 학과 이름 */
    @IsString()
    dept_name!: string;
    /** 학과 영어 이름 */
    @IsString()
    e_dept_name!: string;
    /** 강의 이름, 전산학특강<AI 프로토타이핑> 처럼 꺾쇠도 사용. */
    @IsString()
    sub_title!: string;
    /** 강의 영어 이름 */
    @IsString()
    e_sub_title!: string;
    /** 과목 종류 id로 추정. 아래 subject_type과 대응. */
    @IsInt()
    subject_id!: number;
    /** 과목 종류 한글 명칭. 전공필수, 전공선택 등 */
    @IsString()
    subject_type!: string;
    /** 과목 종류 영어 명칭. Major Elective 등 */
    @IsString()
    e_subject_type!: string;
    /** ? */
    @IsInt()
    course_sect!: number;
    /** 부여 AU */
    @IsInt()
    act_unit!: number;
    /** 강의시간 */
    @IsNumber()
    lecture!: number;
    /** 실습시간 */
    @IsNumber()
    lab!: number;
    /** 학점 */
    @IsInt()
    credit!: number;
    /** 수강 제한 인원 */
    @IsInt()
    limit!: number;
    /** 교수(들) 이름 */
    @IsString()
    prof_names!: string;
    /** 공지사항 */
    @IsString()
    notice!: string;
    /** CS492 형의 과목 코드 */
    @IsString()
    old_no!: string;
    /** 영어 강의 여부 */
    @IsIn(['Y', 'N'])
    english_lec!: string;
    /** 교수(들) 영어 이름 */
    e_prof_names!: string;
  }
}
