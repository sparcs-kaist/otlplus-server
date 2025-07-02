import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'

import { applyOffset, applyOrder } from '@otl/common/utils/util'

import { formatNewLectureCodeWithDot, orderFilter } from '@otl/prisma-client/common'
import { PaginationOption } from '@otl/prisma-client/types'

import { ECourse } from '../entities/ECourse'
import { ELecture } from '../entities/ELecture'
import { EReview } from '../entities/EReview'
import { PrismaService } from '../prisma.service'
import ECourseUser = ECourse.ECourseUser

@Injectable()
export class CourseRepository {
  constructor(private readonly prisma: PrismaService) {}

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

  public async getCourseById(id: number): Promise<ECourse.Details | null> {
    return await this.prisma.subject_course.findUnique({
      // relationLoadStrategy: 'query',
      include: ECourse.Details.include,
      where: {
        id,
      },
    })
  }

  public async getLecturesByCourseId(id: number, order?: string[]): Promise<ELecture.Details[]> {
    const orders = order || ['year', 'semester', 'class_no']
    const course = await this.prisma.subject_course.findUnique({
      include: {
        lecture: {
          include: {
            subject_department: true,
            subject_lecture_professors: { include: { professor: true } },
            subject_classtime: true,
            subject_examtime: true,
          },
          orderBy: orderFilter(orders),
        },
      },
      where: {
        id,
      },
    })
    const filteredLecture = course ? course.lecture.filter((lecture) => !lecture.deleted) : []
    return filteredLecture
  }

  public async getReviewsByCourseId(option: PaginationOption, id: number): Promise<EReview.Details[]> {
    const review = await this.prisma.review_review.findMany({
      where: { course_id: id },
      include: EReview.Details.include,
      take: option.limit,
      skip: option.offset,
      orderBy: orderFilter(option.order),
    })
    return review
  }

  public async getCourses(
    department: string[] | undefined,
    type: string[] | undefined,
    level: string[] | undefined,
    group: string[] | undefined,
    keyword: string | undefined,
    term: string[] | undefined,
    order: string[] | undefined,
    offset: number | undefined,
    limit: number | undefined,
  ): Promise<ECourse.Details[]> {
    const DEFAULT_LIMIT = 150
    const DEFAULT_ORDER = ['old_code'] satisfies (keyof ECourse.Details)[]
    const departmentFilter = this.departmentFilter(department)
    const typeFilter = this.typeFilter(type)
    const groupFilter = this.groupFilter(group)
    const keywordFilter = this.keywordFilter(keyword)
    const term_filter = this.termFilter(term)
    const filterList: object[] = [departmentFilter, typeFilter, groupFilter, keywordFilter, term_filter].filter(
      (filter): filter is object => filter !== null,
    )

    const queryResult = await this.prisma.subject_course.findMany({
      include: ECourse.Details.include,
      where: {
        AND: filterList,
      },
      take: limit ?? DEFAULT_LIMIT,
    })
    const levelFilteredResult = this.levelFilter<ECourse.Details>(queryResult, level)

    // Apply Ordering and Offset
    const orderedResult = applyOrder<ECourse.Details>(
      levelFilteredResult,
      (order as (keyof ECourse.Details)[]) ?? DEFAULT_ORDER,
    )
    return applyOffset<ECourse.Details>(orderedResult, offset ?? 0)
  }

  public departmentFilter(department_names?: string[]): object | null {
    if (!department_names) {
      return null
    }
    if (department_names.includes('ALL')) {
      return null
    }
    if (department_names.includes('ETC')) {
      return {
        subject_department: {
          code: {
            notIn: this.MAJOR_ACRONYMS.filter((x) => department_names.includes(x)),
          },
        },
      }
    }
    return {
      subject_department: {
        code: {
          in: this.MAJOR_ACRONYMS.filter((x) => department_names.includes(x)),
        },
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

  public termFilter(term?: string[]): object | null {
    if (!term) {
      return null
    }

    if (term.includes('ALL')) {
      return null
    }
    const current_year = new Date().getFullYear()
    const term_number = term.map((x) => parseInt(x))[0] ?? 0

    const termFilter: Prisma.subject_courseWhereInput = {
      lecture: {
        some: {
          year: {
            gte: current_year - term_number,
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

  public groupFilter(group?: string[]): object | null {
    if (!group) {
      return null
    }

    const filters = []

    if (group.includes('Basic')) {
      group.splice(group.indexOf('Basic'), 1)
      filters.push({ type_en: { in: ['Basic Required', 'Basic Elective'] } })
    }
    if (group.includes('Humanity')) {
      group.splice(group.indexOf('Humanity'), 1)
      filters.push({ type_en: { startsWith: 'Humanities & Social Elective' } })
    }
    if (group.length) {
      filters.push({
        type_en: {
          in: ['Major Required', 'Major Elective', 'Elective(Graduate)'],
        },
        subject_department: { code: { in: group } },
      })
    }

    return {
      OR: filters,
    }
  }

  public levelFilter<T extends ECourse.Details | ELecture.Details>(queryResult: T[], levels?: string[]): T[] {
    if (!levels) {
      return queryResult
    }

    const levelFilters = levels.map((level) => level[0])
    if (levels.includes('ALL')) {
      return queryResult
    }
    if (levels.includes('ETC')) {
      return queryResult.filter((item) => {
        const level = item.old_code.replace(/[^0-9]/g, '')[0]
        return !levelFilters.includes(level)
      })
    }
    return queryResult.filter((item) => {
      const level = item.old_code.replace(/[^0-9]/g, '')[0]
      return levelFilters.includes(level)
    })
  }

  async getUserTakenCourses(takenLecturesId: number[], order: string[]): Promise<ECourse.DetailWithIsRead[]> {
    const orderFilters: { [key: string]: string }[] = []
    order.forEach((orderList) => {
      const orderDict: { [key: string]: string } = {}
      let sorOrder = 'asc'
      const orderBy = orderList.split('-')
      if (orderBy[0] === '') {
        sorOrder = 'desc'
      }
      orderDict[orderBy[orderBy.length - 1]] = sorOrder
      orderFilters.push(orderDict)
    })
    return this.prisma.subject_course.findMany({
      where: {
        lecture: {
          some: {
            id: {
              in: takenLecturesId,
            },
          },
        },
      },
      orderBy: orderFilters,
      include: {
        subject_department: true,
        subject_course_professors: { include: { professor: true } },
        lecture: true,
        subject_courseuser: true,
      },
    })
  }

  async getCourseAutocomplete(keyword: string): Promise<ECourse.Extended | null> {
    const candidate = await this.prisma.subject_course.findFirst({
      where: {
        OR: [
          { subject_department: { name: { startsWith: keyword } } },
          { subject_department: { name_en: { startsWith: keyword } } },
          { title: { startsWith: keyword } },
          { title_en: { startsWith: keyword } },
          {
            subject_course_professors: {
              some: { professor: { professor_name: { startsWith: keyword } } },
            },
          },
          {
            subject_course_professors: {
              some: {
                professor: { professor_name_en: { startsWith: keyword } },
              },
            },
          },
        ],
      },
      include: ECourse.Extended.include,
      orderBy: { old_code: 'asc' },
    })
    return candidate
  }

  async readCourse(userId: number, courseId: number): Promise<ECourseUser.Basic> {
    const now = new Date()
    return await this.prisma.subject_courseuser.upsert({
      create: {
        latest_read_datetime: now,
        user_profile_id: userId,
        course_id: courseId,
      },
      update: {
        latest_read_datetime: now,
      },
      where: {
        course_id_user_profile_id: {
          course_id: courseId,
          user_profile_id: userId,
        },
      },
    })
  }

  private isRead(courseUser: {
    subject_course: { latest_written_datetime: Date | null }
    latest_read_datetime: Date | null
  }): boolean {
    if (!courseUser.subject_course.latest_written_datetime) return false
    if (!courseUser.latest_read_datetime) return false
    return courseUser.subject_course.latest_written_datetime <= courseUser.latest_read_datetime
  }

  public async isUserSpecificRead(courseId: number | number[], userId: number) {
    let courseIds
    if (!Array.isArray(courseId)) {
      courseIds = [courseId]
    }
    else {
      courseIds = courseId
    }
    const courseUsers = await this.prisma.subject_courseuser.findMany({
      select: {
        subject_course: { select: { latest_written_datetime: true } },
        latest_read_datetime: true,
        user_profile_id: true,
        course_id: true,
      },
      where: {
        course_id: {
          in: courseIds,
        },
        user_profile_id: userId,
      },
    })
    const result: { [key: number]: boolean } = {}
    if (!courseUsers || courseUsers.length === 0) {
      courseIds.forEach((id) => {
        result[id] = false
      })
    }
    else {
      courseUsers.forEach((courseUser) => {
        result[courseUser.course_id] = this.isRead(courseUser)
      })
    }
    return result
  }
}
