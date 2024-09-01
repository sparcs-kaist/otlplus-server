import { Injectable } from '@nestjs/common';
import { Prisma, session_userprofile } from '@prisma/client';
import { ELecture } from 'src/common/entities/ELecture';
import { ILecture } from 'src/common/interfaces/ILecture';
import { applyOffset, applyOrder } from 'src/common/utils/search.utils';
import { groupBy } from '../../common/utils/method.utils';
import { PrismaService } from '../prisma.service';
import { CourseRepository } from './course.repository';
import { FilterType } from '@src/common/types/types';
import SubjectClasstimeFilter = FilterType.SubjectClasstimeFilter;
import Details = ELecture.Details;

@Injectable()
export class LectureRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly courseRepository: CourseRepository,
  ) {}

  async getLectureById(id: number): Promise<ELecture.Details> {
    return await this.prisma.subject_lecture.findUniqueOrThrow({
      include: ELecture.Details.include,
      where: {
        id: id,
      },
    });
  }

  async getLectureBasicById(id: number): Promise<ELecture.Basic> {
    return await this.prisma.subject_lecture.findUniqueOrThrow({
      where: {
        id: id,
      },
    });
  }

  async getLectureByIds(ids: number[]): Promise<ELecture.Details[]> {
    return await this.prisma.subject_lecture.findMany({
      include: ELecture.Details.include,
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  async filterByRequest(query: ILecture.QueryDto): Promise<ELecture.Details[]> {
    const DEFAULT_LIMIT = 300;
    const DEFAULT_ORDER = ['year', 'semester', 'old_code', 'class_no'];
    const researchTypes = [
      'Individual Study',
      'Thesis Study(Undergraduate)',
      'Thesis Research(MA/phD)',
    ];

    const semesterFilter = this.semesterFilter(query?.year, query?.semester);
    const timeFilter = this.timeFilter(query?.day, query?.begin, query?.end);
    const departmentFilter = this.courseRepository.departmentFilter(
      query?.department,
    );
    const typeFilter = this.courseRepository.typeFilter(query?.type);
    const groupFilter = this.courseRepository.groupFilter(query?.group);
    const keywordFilter = this.courseRepository.keywordFilter(
      query?.keyword,
      false,
    );
    const defaultFilter = {
      AND: [
        {
          deleted: false,
        },
        {
          type_en: {
            notIn: researchTypes,
          },
        },
      ],
    };

    const filters: object[] = [
      semesterFilter,
      timeFilter,
      departmentFilter,
      typeFilter,
      groupFilter,
      keywordFilter,
      defaultFilter,
    ].filter((filter): filter is object => filter !== null);
    const queryResult = await this.prisma.subject_lecture.findMany({
      include: {
        subject_department: true,
        subject_lecture_professors: { include: { professor: true } },
        subject_classtime: true,
        subject_examtime: true,
      },
      where: {
        AND: filters,
      },
      take: query.limit ?? DEFAULT_LIMIT,
    });
    const levelFilteredResult =
      this.courseRepository.levelFilter<ELecture.Details>(
        queryResult,
        query?.level,
      );

    const orderedQuery = applyOrder<ELecture.Details>(
      levelFilteredResult,
      (query.order ?? DEFAULT_ORDER) as (keyof ELecture.Details)[],
    );
    return applyOffset<ELecture.Details>(orderedQuery, query.offset ?? 0);
  }

  async findReviewWritableLectures(
    user: session_userprofile,
    date?: Date,
  ): Promise<ELecture.Details[]> {
    type Semester = { semester: number; year: number };
    const currDate = date ?? new Date();
    const notWritableSemesters = await this.prisma.subject_semester.findMany({
      where: {
        OR: [
          {
            courseAddDropPeriodEnd: {
              gte: currDate,
            },
          },
          {
            beginning: {
              gte: currDate,
            },
          },
        ],
      },
    });
    const notWritableYearAndSemester = groupBy<Semester, number>(
      notWritableSemesters.map((semester) => {
        return {
          semester: semester.semester,
          year: semester.year,
        };
      }),
      (subject_semester) => subject_semester.year,
    );

    const notWritableYearAndSemesterMap: Record<
      string,
      Record<string, Semester[] | undefined>
    > = {};
    for (const [key, value] of Object.entries(notWritableYearAndSemester)) {
      if (value) {
        notWritableYearAndSemesterMap[key] = groupBy<Semester, number>(
          value,
          (s) => s.year,
        );
      }
    }

    const takenLectures = await this.getTakenLectures(user);
    const reviewWritableLectures = takenLectures.filter((lecture) => {
      return notWritableYearAndSemesterMap[lecture.year] ?? [lecture.semester]
        ? true
        : false;
    });

    // const lectures = await this.prisma.subject_lecture.findMany({
    //   where: {
    //     AND: notWritableYearAndSemester
    //   }
    // })

    return reviewWritableLectures;
  }

  getResearchLectureQuery(): Prisma.subject_lectureWhereInput {
    return {
      type_en: {
        in: [
          'Individual Study',
          'Thesis Study(Undergraduate)',
          'Thesis Research(MA/phD)',
        ],
      },
    };
  }

  async getTakenLectures(
    user: session_userprofile,
  ): Promise<ELecture.Details[]> {
    const lectures = (
      await this.prisma.session_userprofile_taken_lectures.findMany({
        where: {
          userprofile_id: user.id,
        },
        include: {
          lecture: {
            include: Details.include,
          },
        },
      })
    ).map((takenLecture) => takenLecture.lecture);

    return lectures;
  }

  public semesterFilter(year?: number, semester?: number): object | null {
    if (!year && !semester) {
      return null;
    } else if (!year) {
      return {
        semester: {
          in: semester,
        },
      };
    } else if (!semester) {
      return {
        years: {
          equals: semester,
        },
      };
    } else {
      return {
        AND: [
          {
            year: {
              equals: year,
            },
          },
          {
            semester: {
              equals: semester,
            },
          },
        ],
      };
    }
  }

  public timeFilter(day?: number, begin?: number, end?: number): object | null {
    const datetimeBegin =
      begin !== undefined && begin !== null
        ? this.datetimeConverter(begin)
        : undefined;
    const datetimeEnd =
      end !== undefined && end !== null
        ? this.datetimeConverter(end)
        : undefined;

    const result: any = {};

    if (day !== undefined && day !== null) {
      result.day = day;
    }
    if (datetimeBegin) {
      result.begin = { gte: datetimeBegin };
    }
    if (datetimeEnd) {
      result.end = { lte: datetimeEnd };
    }

    return Object.keys(result).length > 0
      ? { subject_classtime: { some: result } }
      : null;
  }

  public datetimeConverter(time: number): Date {
    const hour = Math.floor(time / 2) + 8;
    const minute = (time % 2) * 30;

    // 1970-01-01 날짜로 고정된 Date 객체 생성
    const date = new Date('1970-01-01T00:00:00.000Z');
    date.setUTCHours(hour, minute, 0, 0); // UTC 시간을 설정

    return date;
  }

  async getLectureAutocomplete({
    year,
    semester,
    keyword,
  }: ILecture.AutocompleteQueryDto): Promise<ELecture.Extended | null> {
    const candidate = await this.prisma.subject_lecture.findFirst({
      where: {
        year,
        semester,
        OR: [
          { subject_department: { name: { startsWith: keyword } } },
          { subject_department: { name_en: { startsWith: keyword } } },
          { title: { startsWith: keyword } },
          { title_en: { startsWith: keyword } },
          {
            subject_lecture_professors: {
              some: { professor: { professor_name: { startsWith: keyword } } },
            },
          },
          {
            subject_lecture_professors: {
              some: {
                professor: { professor_name_en: { startsWith: keyword } },
              },
            },
          },
        ],
      },
      include: ELecture.Extended.include,
    });
    return candidate;
  }

  async getUserLecturesByYearSemester(
    userId: number,
    year: number,
    semester: number,
  ): Promise<ELecture.UserTaken[]> {
    const lectures =
      await this.prisma.session_userprofile_taken_lectures.findMany({
        where: {
          userprofile_id: userId,
          lecture: {
            year: year,
            semester: semester,
            deleted: false,
          },
        },
        include: {
          lecture: ELecture.UserTaken,
        },
      });

    return lectures.map((result) => result.lecture);
  }

  async getLectureDetailsForTimetable(lectureIds: number[]) {
    return await this.prisma.subject_lecture.findMany({
      where: {
        id: {
          in: lectureIds,
        },
      },
      include: {
        subject_lecture_professors: {
          include: {
            professor: true,
          },
        },
        subject_classtime: true, // Include classtime details if needed
      },
    });
  }
}
