import { Prisma } from '@prisma/client';
import { IPrismaMiddleware } from 'src/common/interfaces/IPrismaMiddleware';
import { PrismaService } from '../prisma.service';
import { LectureMiddleware } from './prisma.lecture';
import { LectureProfessorsMiddleware } from './prisma.lectureprofessors';
import { ReviewMiddleware } from './prisma.reviews';
import { ReviewVoteMiddleware } from './prisma.reviewvote';
import { SemesterMiddleware } from './prisma.semester';
import { TimetableMiddleware } from './prisma.timetable';
import { TimetableLectureMiddleware } from './prisma.timetablelecture';

export const mediator = (
  prisma: PrismaService,
  params: Prisma.MiddlewareParams,
): {
  signal: IPrismaMiddleware.IPrismaMiddleware<boolean> | null;
  IsPre: boolean;
} => {
  if (params.model === 'review_review') {
    return { signal: ReviewMiddleware.getInstance(prisma), IsPre: false };
  } else if (params.model === 'review_reviewvote') {
    return { signal: ReviewVoteMiddleware.getInstance(prisma), IsPre: false };
  } else if (params.model === 'timetable_timetable') {
    return { signal: TimetableMiddleware.getInstance(prisma), IsPre: true };
  } else if (params.model === 'timetable_timetable_lectures') {
    return {
      signal: TimetableLectureMiddleware.getInstance(prisma),
      IsPre: true,
    };
  } else if (params.model === 'subject_semester') {
    return { signal: SemesterMiddleware.getInstance(prisma), IsPre: false };
  } else if (params.model === 'subject_lecture_professors') {
    return {
      signal: LectureProfessorsMiddleware.getInstance(prisma),
      IsPre: false,
    };
  } else if (params.model === 'subject_lecture') {
    return { signal: LectureMiddleware.getInstance(prisma), IsPre: false };
  }
  return { signal: null, IsPre: false };
};
