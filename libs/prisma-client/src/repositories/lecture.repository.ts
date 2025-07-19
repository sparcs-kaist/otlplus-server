import { Injectable } from '@nestjs/common'
import { ServerConsumerLectureRepository } from '@otl/server-consumer/out/lecture.repository'
import { LectureBasic, LectureScore } from '@otl/server-nest/modules/lectures/domain/lecture'
import { Prisma, session_userprofile } from '@prisma/client'
import * as console from 'node:console'

import { applyOffset, applyOrder, groupBy } from '@otl/common/utils/util'

import { mapLecture } from '@otl/prisma-client/common/mapper/lecture'
import { PrismaReadService } from '@otl/prisma-client/prisma.read.service'
import { PrismaService } from '@otl/prisma-client/prisma.service'
import { LectureQuery } from '@otl/prisma-client/types/query'

import { ELecture } from '../entities/ELecture'
import { CourseRepository } from './course.repository'

@Injectable()
export class LectureRepository implements ServerConsumerLectureRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaRead: PrismaReadService,
    private readonly courseRepository: CourseRepository,
  ) {}

  async getLectureDetailById(id: number): Promise<ELecture.Details> {
    return await this.prismaRead.subject_lecture.findUniqueOrThrow({
      include: ELecture.Details.include,
      where: {
        id,
      },
    })
  }

  async getLectureBasicById(id: number): Promise<ELecture.Basic> {
    return await this.prismaRead.subject_lecture.findUniqueOrThrow({
      where: {
        id,
      },
    })
  }

  async getLectureByIds(ids: number[]): Promise<ELecture.Details[]> {
    return await this.prismaRead.subject_lecture.findMany({
      include: ELecture.Details.include,
      where: {
        id: {
          in: ids,
        },
      },
    })
  }

  async filterByRequest(query: LectureQuery): Promise<ELecture.Details[]> {
    const DEFAULT_LIMIT = 300
    const DEFAULT_ORDER = ['year', 'semester', 'old_code', 'class_no']
    const researchTypes = ['Individual Study', 'Thesis Study(Undergraduate)', 'Thesis Research(MA/phD)']

    const semesterFilter = this.semesterFilter(query?.year, query?.semester)
    const timeFilter = this.timeFilter(query?.day, query?.begin, query?.end)
    const departmentFilter = this.courseRepository.departmentFilter(query?.department)
    const typeFilter = this.courseRepository.typeFilter(query?.type)
    const groupFilter = this.courseRepository.groupFilter(query?.group)
    const keywordFilter = this.courseRepository.keywordFilter(query?.keyword, false)
    const researchFilter = researchTypes.map((type) => ({
      type_en: {
        not: type,
      },
    }))
    const defaultFilter = {
      AND: [
        {
          deleted: false,
        },
        ...researchFilter,
      ],
    }

    const filters: object[] = [
      semesterFilter,
      timeFilter,
      departmentFilter,
      typeFilter,
      groupFilter,
      keywordFilter,
      defaultFilter,
    ].filter((filter): filter is object => filter !== null)
    const queryResult = await this.prismaRead.subject_lecture.findMany({
      include: {
        subject_department: true,
        subject_lecture_professors: { include: { professor: true } },
        subject_classtime: true,
        subject_examtime: true,
      },
      where: {
        AND: filters,
      },
      orderBy: [{ year: 'desc' }, { semester: 'desc' }, { id: 'asc' }, { type_en: 'asc' }],
      take: query.limit ?? DEFAULT_LIMIT,
    })

    const levelFilteredResult = this.courseRepository.levelFilter<ELecture.Details>(queryResult, query?.level)

    const orderedQuery = applyOrder<ELecture.Details>(
      levelFilteredResult,
      (query.order ?? DEFAULT_ORDER) as (keyof ELecture.Details)[],
    )
    return applyOffset<ELecture.Details>(orderedQuery, query.offset ?? 0)
  }

  async findReviewWritableLectures(user: session_userprofile, date?: Date): Promise<ELecture.Details[]> {
    type Semester = { semester: number, year: number }
    const currDate = date ?? new Date()
    const notWritableSemesters = await this.prismaRead.subject_semester.findMany({
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
    })
    const notWritableYearAndSemester = groupBy<Semester, number>(
      notWritableSemesters.map((semester) => ({
        semester: semester.semester,
        year: semester.year,
      })),
      (subject_semester) => subject_semester.year,
    )

    const notWritableYearAndSemesterMap: Record<string, Record<string, Semester[] | undefined>> = {}
    Object.entries(notWritableYearAndSemester).forEach(([key, value]) => {
      if (value) {
        notWritableYearAndSemesterMap[key] = groupBy<Semester, number>(value, (s) => s.year)
      }
    })

    const takenLectures = await this.getTakenLectures(user)
    const reviewWritableLectures = takenLectures.filter(
      (lecture) => !!(notWritableYearAndSemesterMap[lecture.year] ?? [lecture.semester]),
    )

    // const lectures = await this.prisma.subject_lecture.findMany({
    //   where: {
    //     AND: notWritableYearAndSemester
    //   }
    // })

    return reviewWritableLectures
  }

  getResearchLectureQuery(): Prisma.subject_lectureWhereInput {
    return {
      type_en: {
        in: ['Individual Study', 'Thesis Study(Undergraduate)', 'Thesis Research(MA/phD)'],
      },
    }
  }

  async getTakenLectures(user: session_userprofile): Promise<ELecture.Details[]> {
    const lectures = (
      await this.prismaRead.session_userprofile_taken_lectures.findMany({
        where: {
          userprofile_id: user.id,
        },
        include: {
          lecture: {
            include: ELecture.Details.include,
          },
        },
      })
    ).map((takenLecture) => takenLecture.lecture)

    return lectures
  }

  public semesterFilter(year?: number, semester?: number): object | null {
    if (!year && !semester) {
      return null
    }
    if (!year) {
      return {
        semester: {
          in: semester,
        },
      }
    }
    if (!semester) {
      return {
        years: {
          equals: semester,
        },
      }
    }
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
    }
  }

  public timeFilter(day?: number, begin?: number, end?: number): object | null {
    const datetimeBegin = begin !== undefined && begin !== null ? this.datetimeConverter(begin) : undefined
    const datetimeEnd = end !== undefined && end !== null ? this.datetimeConverter(end) : undefined

    const result: any = {}

    if (day !== undefined && day !== null) {
      result.day = day
    }
    if (datetimeBegin) {
      result.begin = { gte: datetimeBegin }
    }
    if (datetimeEnd) {
      result.end = { lte: datetimeEnd }
    }

    return Object.keys(result).length > 0 ? { subject_classtime: { some: result } } : null
  }

  public datetimeConverter(time: number): Date {
    const hour = Math.floor(time / 2) + 8
    const minute = (time % 2) * 30

    // 1970-01-01 날짜로 고정된 Date 객체 생성
    const date = new Date('1970-01-01T00:00:00.000Z')
    date.setUTCHours(hour, minute, 0, 0) // UTC 시간을 설정

    return date
  }

  async getLectureAutocomplete(year: number, semester: number, keyword: string): Promise<ELecture.Extended | null> {
    const candidate = await this.prismaRead.subject_lecture.findFirst({
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
    })
    return candidate
  }

  async getUserLecturesByYearSemester(userId: number, year: number, semester: number): Promise<ELecture.UserTaken[]> {
    const lectures = await this.prismaRead.session_userprofile_taken_lectures.findMany({
      where: {
        userprofile_id: userId,
        lecture: {
          year,
          semester,
          deleted: false,
        },
      },
      include: {
        lecture: ELecture.UserTaken,
      },
    })

    return lectures.map((result) => result.lecture)
  }

  async getLectureDetailsForTimetable(lectureIds: number[]) {
    return await this.prismaRead.subject_lecture.findMany({
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
    })
  }

  async getLectureById(lectureId: number): Promise<LectureBasic> {
    const lecture = await this.prismaRead.subject_lecture.findUniqueOrThrow({
      where: {
        id: lectureId,
      },
    })
    return mapLecture(lecture)
  }

  async getRelatedLectureById(lectureId: number): Promise<LectureBasic[]> {
    const lecture = await this.prismaRead.subject_lecture.findUniqueOrThrow({
      where: {
        id: lectureId,
      },
    })
    return this.prismaRead.subject_lecture
      .findMany({
        where: {
          course_id: lecture.course_id,
          deleted: false,
          year: lecture.year,
          semester: lecture.semester,
        },
      })
      .then((lectures) => lectures.map((l) => mapLecture(l)))
  }

  async updateLectureTitle(lectures: LectureBasic[], commonTitle: string, isEnglish: boolean): Promise<boolean> {
    const titleFieldMap = {
      ko: {
        getTitle: (lecture: LectureBasic) => lecture.title,
        updateClassField: 'class_title',
        updateCommonField: 'common_title',
      },
      en: {
        getTitle: (lecture: LectureBasic) => lecture.titleEn,
        updateClassField: 'class_title_en',
        updateCommonField: 'common_title_en',
      },
    } as const
    const { getTitle, updateClassField, updateCommonField } = titleFieldMap[isEnglish === true ? 'en' : 'ko']

    return await Promise.all(
      lectures.map(async (lecture) => {
        const titleField = getTitle(lecture)

        const classTitle = titleField !== commonTitle
          ? titleField.substring(commonTitle.length)
          : lecture.classNo.length > 0
            ? lecture.classNo
            : 'A'

        return this.prisma.subject_lecture.update({
          where: { id: lecture.id },
          data: {
            [updateCommonField]: commonTitle,
            [updateClassField]: classTitle,
          },
        })
      }),
    )
      .then((results) => results.length > 0)
      .catch((error) => {
        console.error('Error updating lecture titles:', error)
        return false
      })
  }

  async updateLectureScore(id: number, grades: LectureScore): Promise<LectureBasic> {
    const lecture = await this.prisma.subject_lecture.update({
      where: { id },
      data: {
        review_total_weight: grades.reviewTotalWeight,
        grade_sum: grades.gradeSum,
        load_sum: grades.loadSum,
        speech_sum: grades.speechSum,
        grade: grades.grade,
        load: grades.load,
        speech: grades.speech,
      },
    })
    return mapLecture(lecture)
  }

  async countNumPeople(lectureId: number): Promise<number> {
    return (
      (
        await this.prismaRead.timetable_timetable.findMany({
          distinct: ['user_id'],
          where: {
            timetable_timetable_lectures: {
              some: {
                lecture_id: lectureId,
              },
            },
          },
        })
      )?.length ?? 0
    )
  }

  async updateNumPeople(lectureId: number, count: number): Promise<LectureBasic> {
    return mapLecture(
      await this.prisma.subject_lecture.update({
        where: { id: lectureId },
        data: {
          num_people: count,
        },
      }),
    )
  }
}
