import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'

import { PrismaReadService } from '@otl/prisma-client/prisma.read.service'
import { PrismaService } from '@otl/prisma-client/prisma.service'

import { ELecture } from '../entities/ELecture'
import { ELectureV2 } from '../entities/ELectureV2'
import { EProfessorV2 } from '../entities/EProfessorV2'
import { CourseRepositoryV2 } from './course.v2.repository'

@Injectable()
export class LectureRepositoryV2 {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaRead: PrismaReadService,
    private readonly courseRepository: CourseRepositoryV2,
  ) {}

  async filterByRequest(
    keyword: string | undefined,
    type: string[] | undefined,
    department: number[] | undefined,
    level: string[] | undefined,
    year: number, // year required
    semester: number, // semester required
    day: number | undefined,
    begin: number | undefined,
    end: number | undefined,
    order: string | undefined,
    limit: number | undefined,
    offset: number | undefined,
  ): Promise<ELectureV2.Basic[]> {
    const DEFAULT_LIMIT = 300
    // const DEFAULT_ORDER = ['year', 'semester', 'old_code', 'class_no']
    const researchTypes = ['Individual Study', 'Thesis Study(Undergraduate)', 'Thesis Research(MA/phD)']

    const semesterFilter = this.semesterFilter(year, semester)
    const timeFilter = this.timeFilter(day, begin, end)
    const departmentFilter = this.courseRepository.departmentFilter(department)
    const typeFilter = this.courseRepository.typeFilter(type)
    const keywordFilter = this.courseRepository.keywordFilter(keyword, false)
    const levelFilter = this.courseRepository.levelFilter(level)
    const researchFilter = researchTypes.map((researchType) => ({
      type_en: {
        not: researchType,
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
      keywordFilter,
      defaultFilter,
      levelFilter,
    ].filter((filter): filter is object => filter !== null)
    const queryResult = await this.prismaRead.subject_lecture.findMany({
      where: {
        AND: filters,
      },
      select: ELectureV2.BasicArgs.select,
      orderBy: [{ year: 'desc' }, { semester: 'desc' }, { old_code: 'asc' }, { class_no: 'asc' }],
      skip: offset ?? 0,
      take: limit ?? DEFAULT_LIMIT,
    })

    // const orderedQuery = applyOrder<ELecture.Details>(
    //   levelFilteredResult,
    //   (query.order ?? DEFAULT_ORDER) as (keyof ELecture.Details)[],
    // )
    // return applyOffset<ELecture.Details>(orderedQuery, query.offset ?? 0)
    return queryResult
  }

  getResearchLectureQuery(): Prisma.subject_lectureWhereInput {
    return {
      type_en: {
        in: ['Individual Study', 'Thesis Study(Undergraduate)', 'Thesis Research(MA/phD)'],
      },
    }
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
    const hour = Math.floor(time / 60)
    const minute = time % 60

    // 1970-01-01 날짜로 고정된 Date 객체 생성
    const date = new Date('1970-01-01T00:00:00.000Z')
    date.setUTCHours(hour, minute, 0, 0) // UTC 시간을 설정

    return date
  }

  // 한 강의에 연관된 professors, classtimes, examtimes 가져오기
  // [id, classTimes, examTimes, professors] 세트를 return
  public async getLectureMetadataByIds(
    ids: number[],
  ): Promise<Array<[number, ELectureV2.ClassTime[], ELectureV2.ExamTime | null, EProfessorV2.Basic[]]>> {
    if (!ids || ids.length === 0) return []

    const [classTimes, examTimes, professorLinks] = await Promise.all([
      this.prismaRead.subject_classtime.findMany({
        where: { lecture_id: { in: ids } },
        select: { lecture_id: true, ...ELectureV2.ClassTimeArgs.select },
      }),
      this.prismaRead.subject_examtime.findMany({
        where: { lecture_id: { in: ids } },
        select: { lecture_id: true, ...ELectureV2.ExamTimeArgs.select },
      }),
      this.prismaRead.subject_lecture_professors.findMany({
        where: { lecture_id: { in: ids } },
        select: {
          lecture_id: true,
          professor: { select: EProfessorV2.BasicArgs.select },
        },
      }),
    ])

    // 1) classTimes: lecture_id -> ClassTime[]
    const ctByLecture = new Map<number, ELectureV2.ClassTime[]>()
    for (const ct of classTimes as Array<ELectureV2.ClassTime & { lecture_id: number }>) {
      const arr = ctByLecture.get(ct.lecture_id) ?? []
      arr.push(ct)
      ctByLecture.set(ct.lecture_id, arr)
    }

    // 2) examTimes: lecture_id -> ExamTime
    const etByLecture = new Map<number, ELectureV2.ExamTime>()
    for (const et of examTimes as Array<ELectureV2.ExamTime & { lecture_id: number }>) {
      const key = (et as any).lecture_id as number
      if (!etByLecture.has(key)) {
        etByLecture.set(key, et)
      }
    }

    // 3) professors: lecture_id -> ProfessorBasic[]
    const profByLecture = new Map<number, EProfessorV2.Basic[]>()
    for (const link of professorLinks as Array<{ lecture_id: number, professor: EProfessorV2.Basic }>) {
      const arr = profByLecture.get(link.lecture_id) ?? []
      arr.push(link.professor)
      profByLecture.set(link.lecture_id, arr)
    }

    return ids.map((id) => {
      const exam = etByLecture.get(id) ?? null
      return [id, ctByLecture.get(id) ?? [], exam as ELectureV2.ExamTime | null, profByLecture.get(id) ?? []]
    })
  }

  // year, semester 필터링 버전 + userId 만으로 조회
  async getTakenLecturesBySemester(userId: number, year: number, semester: number): Promise<ELecture.Details[]> {
    const lectures = (
      await this.prismaRead.session_userprofile_taken_lectures.findMany({
        where: {
          userprofile_id: userId,
          lecture: {
            year,
            semester,
          },
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
}
