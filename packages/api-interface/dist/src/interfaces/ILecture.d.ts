import { IDepartment } from '@otl/api-interface/src';
import { ICourse } from '@otl/api-interface/src/interfaces/ICourse';
import { IProfessor } from '@otl/api-interface/src/interfaces/IProfessor';
import { ITimetable } from '@otl/api-interface/src/interfaces/ITimetable';
import { TimeBlock } from './constants';
export declare namespace ILecture {
  interface Classtime {
    building_code: string;
    room_name: string;
    classroom: string;
    classroom_en: string;
    classroom_short: string;
    classroom_short_en: string;
    day: number;
    begin: number;
    end: number;
  }
  interface ExamTime {
    day: number;
    str: string;
    str_en: string;
    begin: number;
    end: number;
  }
  interface Raw {
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
    num_people: number | null;
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
    subject_classtime: ITimetable.IClasstime[];
  }
  interface Basic {
    id: number;
    title: string;
    title_en: string;
    course: number;
    old_old_code: string;
    old_code: string;
    class_no: string;
    year: number;
    semester: number;
    code: string;
    department: number;
    department_code: string;
    department_name: string;
    department_name_en: string;
    type: string;
    type_en: string;
    limit: number;
    num_people: number;
    is_english: boolean;
    num_classes: number;
    num_labs: number;
    credit: number;
    credit_au: number;
    common_title: string;
    common_title_en: string;
    class_title: string;
    class_title_en: string;
    review_total_weight: number;
    professors: IProfessor.Basic[];
  }
  interface Detail extends Basic {
    grade: number;
    load: number;
    speech: number;
    classtimes: Classtime[];
    examtimes: ExamTime[];
  }
  interface UserTaken extends Omit<Basic, 'department'> {
    classTime: Classtime;
    department: IDepartment.Basic;
  }
  interface Summary {
    id: number;
    course_id: number;
    title: string;
    title_en: string;
    professor_name: string;
    professor_name_en: string;
    classroom: string;
    classroom_en: string;
    timeBlocks: TimeBlock[];
  }
  interface Detail2 extends Detail {
    timeBlocks: TimeBlock[];
  }
  class QueryDto extends ICourse.Query {
    year?: number;
    semester?: number;
    day?: number;
    begin?: number;
    end?: number;
  }
  class AutocompleteQueryDto {
    year: number;
    semester: number;
    keyword: string;
  }
}
