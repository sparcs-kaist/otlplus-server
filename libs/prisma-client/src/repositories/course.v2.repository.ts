import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'

import { formatNewLectureCodeWithDot } from '@otl/prisma-client/common'
import { PrismaReadService } from '@otl/prisma-client/prisma.read.service'

import { ECourseV2 } from '../entities/ECourseV2'
import { PrismaService } from '../prisma.service'

@Injectable()
export class CourseRepositoryV2 {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaRead: PrismaReadService,
  ) {}

  private TYPE_ACRONYMS = {
    GR: 'General Required',
    MGC: 'Mandatory General Courses',
    BE: 'Basic Elective',
    BR: 'Basic Required',
    EG: 'Elective(Graduate)',
    HSE: 'Humanities & Social Elective',
    OE: 'Other Elective',
    ME: 'Major Elective',
    MR: 'Major Required',
  }

  private MAJOR_ACRONYMS = [
    'CE',
    'MSB',
    'ME',
    'PH',
    'BiS',
    'IE',
    'ID',
    'BS',
    'CBE',
    'MAS',
    'MS',
    'NQE',
    'HSS',
    'EE',
    'CS',
    'AE',
    'CH',
    'TS',
    'BTM',
    'BCS',
    'SS',
  ]

  public async getCourses(
    department: number[] | undefined,
    type: string[] | undefined,
    level: string[] | undefined,
    keyword: string | undefined,
    term: number | undefined,
    order: string | undefined,
    offset: number | undefined,
    limit: number | undefined,
  ): Promise<ECourseV2.BasicWithProfessors[]> {
    const DEFAULT_LIMIT = 150
    // const DEFAULT_ORDER = ['old_code'] satisfies (keyof ECourse.Details)[]
    const departmentFilter = this.departmentFilter(department)
    const typeFilter = this.typeFilter(type)
    const keywordFilter = this.keywordFilter(keyword)
    const term_filter = this.termFilter(term)
    const levelFilter = this.levelFilter(level)
    const filterList: object[] = [departmentFilter, typeFilter, keywordFilter, term_filter, levelFilter].filter(
      (filter): filter is object => filter !== null,
    )

    const queryResult = await this.prismaRead.subject_course.findMany({
      select: ECourseV2.BasicWithProfessorsArgs.select,
      where: {
        AND: filterList,
      },
      orderBy: [{ new_code: 'asc' }],
      skip: offset ?? 0,
      take: limit ?? DEFAULT_LIMIT,
    })

    // Apply Ordering and Offset
    // const orderedResult = applyOrder<ECourse.Details>(
    //   levelFilteredResult,
    //   (order as (keyof ECourse.Details)[]) ?? DEFAULT_ORDER,
    // )
    // return applyOffset<ECourse.Details>(orderedResult, offset ?? 0)
    return queryResult
  }

  public departmentFilter(department_ids?: number[]): object | null {
    if (!department_ids) {
      return null
    }
    return {
      department_id: {
        in: department_ids,
      },
    }
  }

  public typeFilter(types?: string[]): object | null {
    if (!types) {
      return null
    }

    if (types.includes('ALL')) {
      return null
    }
    if (types.includes('ETC')) {
      const unselected_types = Object.keys(this.TYPE_ACRONYMS)
        .filter((type) => !(type in types))
        .map((type) => this.TYPE_ACRONYMS[type as keyof typeof this.TYPE_ACRONYMS])
      return {
        OR: unselected_types.map((type) => ({
          type_en: {
            contains: type, // OR 조건으로 LIKE와 비슷한 매칭
          },
        })),
      }
    }
    return {
      OR: types.map((type) => ({
        type_en: {
          contains: this.TYPE_ACRONYMS[type as keyof typeof this.TYPE_ACRONYMS],
        },
      })),
    }
  }

  public termFilter(term?: number): object | null {
    // 설정 없는 경우 all
    if (!term) {
      return null
    }
    const current_year = new Date().getFullYear()

    const termFilter: Prisma.subject_courseWhereInput = {
      lecture: {
        some: {
          year: {
            gte: current_year - term,
          },
        },
      },
    }
    return termFilter
  }

  public keywordFilter(keyword?: string, isCourse = true): object | null {
    if (!keyword) {
      return null
    }

    const keyword_trimed = keyword.trim()
    const keyword_space_removed = keyword_trimed.replace(/\s/g, '')
    const title_filter = {
      title_no_space: {
        contains: keyword_space_removed,
      },
    }
    const en_title_filter = {
      title_en_no_space: {
        contains: keyword_space_removed,
      },
    }
    const department_name_filter = {
      subject_department: {
        name: keyword_trimed,
      },
    }
    const department_name_en_filter = {
      subject_department: {
        name_en: keyword_trimed,
      },
    }
    const professors_professor_name_filter = isCourse
      ? {
        subject_course_professors: {
          some: {
            professor: {
              professor_name: {
                contains: keyword_trimed,
              },
            },
          },
        },
      }
      : {
        subject_lecture_professors: {
          some: {
            professor: {
              professor_name: {
                contains: keyword_trimed,
              },
            },
          },
        },
      }
    const professors_professor_name_en_filter = isCourse
      ? {
        subject_course_professors: {
          some: {
            professor: {
              professor_name_en: {
                contains: keyword_trimed,
              },
            },
          },
        },
      }
      : {
        subject_lecture_professors: {
          some: {
            professor: {
              professor_name_en: {
                contains: keyword_trimed,
              },
            },
          },
        },
      }

    const old_code_filter = {
      old_code: {
        contains: keyword_space_removed,
      },
    }

    const new_code_filter = {
      new_code: {
        contains: formatNewLectureCodeWithDot(keyword_space_removed),
      },
    }
    return {
      OR: [
        title_filter,
        en_title_filter,
        old_code_filter,
        new_code_filter,
        department_name_filter,
        department_name_en_filter,
        professors_professor_name_filter,
        professors_professor_name_en_filter,
      ],
    }
  }

  public levelFilter(levels?: string[]): object | null {
    if (!levels || levels.includes('ALL')) {
      return null
    }

    const levelDigits = levels.map((l) => l[0])

    // ETC일 경우: level이 선택된 levelDigit들에 **포함되지 않는** 값
    if (levels.includes('ETC')) {
      return {
        level: {
          notIn: levelDigits,
        },
      }
    }

    // 일반적인 in 조건
    return {
      level: {
        in: levelDigits,
      },
    }
  }

  // course 상세정보 가져오기 (id)
  public async getCourseById(courseId: number): Promise<{
    course: ECourseV2.CourseDetail | null
    lectures: ECourseV2.CourseNestedLectures[]
  }> {
    const course = await this.prismaRead.subject_course.findUnique({
      where: { id: courseId },
      select: ECourseV2.CourseDetailArgs.select,
    })

    const lectures = await this.prismaRead.subject_lecture.findMany({
      where: { course_id: courseId },
      select: ECourseV2.courseNestedLecturesArgs.select,
    })
    return { course, lectures }
  }

  // @Todo : 성능 최적화를 하려 한다면 User가 들은 coruse, lecture 찾는 메서드 캐싱
  // 수강 여부 확인을 위해 수강한 course의 id list를 반환하는 메서드
  public async getTakenCourseIdsByUser(userId: number): Promise<number[]> {
    // user가 수강한 lecture의 id들
    const takenLectures = await this.prismaRead.session_userprofile_taken_lectures.findMany({
      where: { userprofile_id: userId },
      select: { lecture_id: true },
    })
    const lectureIds = takenLectures.map((lt) => lt.lecture_id)
    if (lectureIds.length === 0) {
      return []
    }

    // lecture id들로 부터 course id 찾기
    const takenCourses = await this.prismaRead.subject_lecture.findMany({
      where: { id: { in: lectureIds } },
      select: { course_id: true },
      distinct: ['course_id'],
    })
    return takenCourses.map((tc) => tc.course_id)
  }

  // 특정 course에 대해서 user가 수강한 lecture 가져오기 (id만)
  // @Todo : LectureV2Repository로 옮기기
  public async getTakenLectureIdsByUser(userId: number, courseId: number): Promise<number[]> {
    // 1) 본인이 수강한 lecture 가져오기 : (lecture id, course_id)가져오기
    const takenLectureIds = await this.prismaRead.session_userprofile_taken_lectures.findMany({
      where: { userprofile_id: userId },
      select: {
        lecture_id: true,
      },
    })
    // 2)  해당 course에 속한 lecture인지 필터링
    const lecturesInCourse = await this.prismaRead.subject_lecture.findMany({
      where: { course_id: courseId },
      select: { id: true },
    })
    const lectureIdsInCourse = lecturesInCourse.map((lec) => lec.id)
    return takenLectureIds.map((lt) => lt.lecture_id).filter((id) => lectureIdsInCourse.includes(id))
  }
}
