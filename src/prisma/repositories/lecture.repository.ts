import { Injectable } from '@nestjs/common';
import { Prisma, session_userprofile } from '@prisma/client';
import { ELecture } from 'src/common/entities/ELecture';
import { ILecture } from 'src/common/interfaces/ILecture';
import { LectureQueryDto } from 'src/common/interfaces/dto/lecture/lecture.request.dto';
import { applyOffset, applyOrder } from 'src/common/utils/search.utils';
import {
  LectureBasic,
  LectureDetails,
  LectureReviewDetails,
  lectureDetails,
} from '../../common/schemaTypes/types';
import { groupBy } from '../../common/utils/method.utils';
import { PrismaService } from '../prisma.service';
import { CourseRepository } from './course.repository';

@Injectable()
export class LectureRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly courseRepository: CourseRepository,
  ) {}

  async getLectureById(id: number): Promise<LectureDetails> {
    return await this.prisma.subject_lecture.findUniqueOrThrow({
      include: lectureDetails.include,
      where: {
        id: id,
      },
    });
  }

  async getLectureReviewsById(
    id: number,
    order: string[],
    offset: number,
    limit: number,
  ): Promise<LectureReviewDetails | null> {
    const orderFilter: { [key: string]: string }[] = [];
    order.forEach((orderList) => {
      const orderDict: { [key: string]: string } = {};
      let order = 'asc';
      const orderBy = orderList.split('-');
      if (orderBy[0] == '') {
        order = 'desc';
      }
      orderDict[orderBy[orderBy.length - 1]] = order;
      orderFilter.push(orderDict);
    });

    return await this.prisma.subject_lecture.findUnique({
      include: {
        review: {
          include: {
            course: {
              include: {
                subject_department: true,
                subject_course_professors: { include: { professor: true } },
                lecture: true,
                subject_courseuser: true,
              },
            },
            lecture: {
              include: {
                subject_department: true,
                subject_lecture_professors: { include: { professor: true } },
                subject_classtime: true,
                subject_examtime: true,
              },
            },
            review_reviewvote: true,
          },
          orderBy: orderFilter,
          skip: offset,
          take: limit,
        },
      },
      where: {
        id: id,
      },
    });
  }

  async getLectureBasicById(id: number): Promise<LectureBasic> {
    return await this.prisma.subject_lecture.findUniqueOrThrow({
      where: {
        id: id,
      },
    });
  }

  async getLectureByIds(ids: number[]): Promise<LectureDetails[]> {
    return await this.prisma.subject_lecture.findMany({
      include: lectureDetails.include,
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  async filterByRequest(query: LectureQueryDto): Promise<LectureDetails[]> {
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
      this.courseRepository.levelFilter<LectureDetails>(
        queryResult,
        query?.level,
      );

    const orderedQuery = applyOrder<LectureDetails>(
      levelFilteredResult,
      (query.order ?? DEFAULT_ORDER) as (keyof LectureDetails)[],
    );
    return applyOffset<LectureDetails>(orderedQuery, query.offset ?? 0);
  }

  async findReviewWritableLectures(
    user: session_userprofile,
    date?: Date,
  ): Promise<LectureDetails[]> {
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

  async getTakenLectures(user: session_userprofile): Promise<LectureDetails[]> {
    const lectures = (
      await this.prisma.session_userprofile_taken_lectures.findMany({
        where: {
          userprofile_id: user.id,
        },
        include: {
          lecture: {
            include: {
              subject_lecture_professors: {
                include: {
                  professor: true,
                },
              },
              subject_department: true,
              subject_examtime: true,
              subject_classtime: true,
            },
          },
        },
      })
    ).map((takenLecture) => takenLecture.lecture);

    return lectures;
  }

  public semesterFilter(years?: number[], semesters?: number[]): object | null {
    if (!years && !semesters) {
      return null;
    } else if (!years) {
      return {
        semester: {
          in: semesters,
        },
      };
    } else if (!semesters) {
      return {
        years: {
          in: semesters,
        },
      };
    } else {
      return {
        AND: [
          {
            year: {
              in: years,
            },
          },
          {
            semester: {
              in: semesters,
            },
          },
        ],
      };
    }
  }

  public timeFilter(day?: number[], begin?: number[], end?: number[]): object {
    const datetimeBegin = begin?.map((time) => this.datetimeConverter(time));
    const datetimeEnd = end?.map((time) => this.datetimeConverter(time));

    const dayFilter = day ? { day: { in: day } } : null;
    const beginFilter = begin ? { begin: { in: datetimeBegin } } : null;
    const endFilter = end ? { end: { in: datetimeEnd } } : null;
    return {
      AND: [dayFilter, beginFilter, endFilter],
    };
  }

  public datetimeConverter(time: number) {
    const hour = Math.floor(time / 2) + 8;
    const minute = (time % 2) * 30;
    return new Date(0, 0, 0, hour, minute, 0, 0);
  }

  async getLectureAutocomplete({
    year,
    semester,
    keyword,
  }: ILecture.AutocompleteDto): Promise<ELecture.Extended | null> {
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

  async getProfessorsByLectureId(lectureId: number) {
    return await this.prisma.subject_lecture.findUnique({
      where: { id: lectureId },
      include: {
        subject_lecture_professors: {
          include: {
            professor: true,
          },
        },
      },
    });
  }

  async getClassroomByLectureId(lectureId: number) {
    return await this.prisma.subject_lecture.findUnique({
      where: { id: lectureId },
      include: {
        subject_classtime: true,
      },
    });
  }
}
