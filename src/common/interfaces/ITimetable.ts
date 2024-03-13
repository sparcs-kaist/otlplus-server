export namespace ITimetable {
  export interface IClasstime {
    id: number;
    day: number;
    begin: Date;
    end: Date;
    type: string;
    building_id: string | null;
    building_full_name: string | null;
    building_full_name_en: string | null;
    room_name: string | null;
    unit_time: number | null;
    lecture_id: number | null;
    // Additional properties as needed
  }

  export interface ILecture {
    id: number;
    code: string;
    old_code: string;
    year: number;
    semester: number;
    department_id: number;
    class_no: string;
    title: string;
    title_en: string;
    type: string;
    type_en: string;
    audience: number;
    credit: number;
    title_en_no_space: string;
    title_no_space: string;
    num_classes: number;
    num_labs: number;
    credit_au: number;
    limit: number;
    num_people: number | null; // Allow num_people to be null
    is_english: boolean;
    deleted: boolean;
    course_id: number;
    grade_sum: number;
    load_sum: number;
    speech_sum: number;
    grade: number;
    load: number;
    speech: number;
    review_total_weight: number;
    class_title: string | null;
    class_title_en: string | null;
    common_title: string | null;
    common_title_en: string | null;
    subject_classtime: IClasstime[];
    // professor_names: string[] | null; // 교수 이름 목록
    // professor_names_en: string[] | null; // 교수 영문 이름 목록
    // classroom_str: string | null; // 강의실 문자열
    // classroom_str_en: string | null; // 강의실 영문 문자열
    // classroom_short: string | null; // 강의실 축약 문자열
    // classroom_short_en: string | null; // 강의실 영문 축약 문자열
    // Additional properties as needed
  }

  // Other interfaces as needed...
}
