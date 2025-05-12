import { SyncType } from '@prisma/client';
export declare namespace ISync {
  class ScholarDBBody {
    year: number;
    semester: number;
    lectures: ScholarLectureType[];
    charges: ScholarChargeType[];
  }
  class ScholarLectureType {
    LECTURE_YEAR: number;
    LECTURE_TERM: number;
    SUBJECT_NO: string;
    LECTURE_CLASS: string;
    DEPT_ID: number;
    DEPT_NAME: string;
    E_DEPT_NAME: string;
    SUB_TITLE: string;
    E_SUB_TITLE: string;
    SUBJECT_ID: string;
    SUBJECT_TYPE: string;
    E_SUBJECT_TYPE: string;
    COURSE_SECT: number;
    ACT_UNIT: number;
    LECTURE: number;
    LAB: number;
    CREDIT: number;
    LIMIT: number;
    PROF_NAMES: string;
    NOTICE: string;
    OLD_NO: string;
    ENGLISH_LEC: 'Y' | 'N' | '';
    E_PROF_NAMES: string;
  }
  class ScholarChargeType {
    LECTURE_YEAR: number;
    LECTURE_TERM: number;
    SUBJECT_NO: string;
    LECTURE_CLASS: string;
    DEPT_ID: number;
    PROF_ID: number;
    PROF_NAME: string;
    PORTION: number;
    E_PROF_NAME?: string | null;
  }
  class ExamtimeBody {
    year: number;
    semester: number;
    examtimes: ExamtimeType[];
  }
  class ExamtimeType {
    LECTURE_YEAR: number;
    LECTURE_TERM: number;
    SUBJECT_NO: string;
    LECTURE_CLASS: string;
    DEPT_ID: number;
    EXAM_DAY: number;
    EXAM_BEGIN: string;
    EXAM_END: string;
    NOTICE: string;
  }
  class ClasstimeBody {
    year: number;
    semester: number;
    classtimes: ClasstimeType[];
  }
  class ClasstimeType {
    LECTURE_YEAR: number;
    LECTURE_TERM: number;
    SUBJECT_NO: string;
    LECTURE_CLASS: string;
    DEPT_ID: number;
    LECTURE_DAY: number;
    LECTURE_BEGIN: string;
    LECTURE_END: string;
    LECTURE_TYPE: 'l' | 'e';
    BUILDING: string;
    ROOM_NO: string;
    ROOM_K_NAME: string;
    ROOM_E_NAME: string;
    TEACHING: number | null;
  }
  class TakenLectureBody {
    year: number;
    semester: number;
    attend: AttendType[];
  }
  class AttendType {
    LECTURE_YEAR: number;
    LECTURE_TERM: number;
    SUBJECT_NO: string;
    LECTURE_CLASS: string;
    DEPT_ID: number;
    STUDENT_NO: number;
    PROCESS_TYPE: 'I' | 'C';
  }
  class CronExpress {
    cron: string;
  }
  class SyncTerm {
    year: number;
    semester: 1 | 2 | 3 | 4;
    interval: number;
  }
  type SyncTimeType = typeof SyncType.EXAMTIME | typeof SyncType.CLASSTIME;
  class SyncResultSummaries {
    time: Date;
    year: number;
    semester: number;
    results: SyncResultSummary[];
  }
  class SyncResultSummary {
    type: SyncType;
    created: number;
    updated: number;
    skipped: number;
    deleted: number;
    errors: number;
  }
  class SyncResultDetails {
    time: Date;
    semester: number;
    year: number;
    results: SyncResultDetail[];
  }
  class SyncResultDetail {
    constructor(type: SyncType);
    type: SyncType;
    created: any[];
    updated: any[];
    skipped: any[];
    errors: any[];
    deleted: any[];
  }
}
