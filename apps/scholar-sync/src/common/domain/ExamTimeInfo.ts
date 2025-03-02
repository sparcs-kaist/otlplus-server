import { ISync } from '@otl/api-interface/dist/src/interfaces/ISync';
import { ELecture } from '@otl/api-interface/dist/src';

export class ExamtimeInfo {
  day: number;
  begin: Date;
  end: Date;

  public static deriveExamtimeInfo(examtime: ISync.ExamtimeType): ExamtimeInfo {
    return {
      day: examtime.EXAM_DAY - 1,
      begin: new Date('1970-01-01T' + examtime.EXAM_BEGIN.slice(11) + 'Z'),
      end: new Date('1970-01-01T' + examtime.EXAM_END.slice(11) + 'Z'),
    };
  }

  public static equals(examtime: ExamtimeInfo, existing: ELecture.Details['subject_examtime'][number]) {
    return (
      examtime.day === existing.day &&
      examtime.begin.getHours() === existing.begin.getHours() &&
      examtime.begin.getMinutes() === existing.begin.getMinutes()
    );
  }
}
