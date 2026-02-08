import { Injectable } from '@nestjs/common'
import { ICourseV2, IProfessorV2 } from '@otl/server-nest/common/interfaces/v2'
import { ElasticsearchService } from '@otl/server-nest/modules/elasticsearch/elasticsearch.service'
import { session_userprofile } from '@prisma/client'

import { ECourseV2 } from '@otl/prisma-client/entities'
import { CourseRepositoryV2, LectureRepository } from '@otl/prisma-client/repositories'
import { ProfessorRepositoryV2 } from '@otl/prisma-client/repositories/professor.repository.v2'

type language = 'ko' | 'en'

type courseHistory = {
  year: number
  semester: number
  // 그 학기에 개설된 분반들
  classes: {
    lectureId: number
    classNo: string
    // 각 분반의 담당 교수님(들)
    professors: IProfessorV2.Basic[]
  }[]
  myLectureId: number | null
}

const fallbackEmpty = (preferred?: string | null, fallback?: string | null) => (preferred ?? '').trim() || (fallback ?? '')

function toICourseBasic(c: ECourseV2.BasicWithProfessors, lang: language, completed: boolean): ICourseV2.Basic {
  return {
    id: c.id,
    name: lang === 'en' ? fallbackEmpty(c.title_en, c.title) : c.title,
    code: c.new_code,
    type: lang === 'en' ? fallbackEmpty(c.type_en, c.type) : c.type,
    department: {
      id: c.subject_department.id,
      name:
        lang === 'en'
          ? fallbackEmpty(c.subject_department.name_en, c.subject_department.name)
          : c.subject_department.name,
    },
    professors: c.subject_course_professors.map((p) => ({
      id: p.professor.id,
      name:
        lang === 'en'
          ? fallbackEmpty(p.professor.professor_name_en, p.professor.professor_name)
          : p.professor.professor_name,
    })),
    summary: c.summury, // @Todo : summary db 필드 오타 수정
    open: false, // TODO: 현재 학기 개설 여부 로직
    completed,
  }
}

@Injectable()
export class CoursesServiceV2 {
  constructor(
    private readonly courseRepository: CourseRepositoryV2,
    private readonly lectureRepository: LectureRepository,
    private readonly professorRepository: ProfessorRepositoryV2,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  public async getCourses(
    query: ICourseV2.Query,
    user: session_userprofile | null,
    lang: language,
  ): Promise<ICourseV2.GETCoursesResponse> {
    const {
      department, type, level, keyword, term, order, offset, limit,
    } = query
    
    let queryResult: ECourseV2.BasicWithProfessors[]
    let totalCount: number

    // Use Elasticsearch for keyword search, fallback to Prisma for non-keyword searches
    if (keyword) {
      try {
        // todo: does this work properly?
        const level_str = level ? level.map((l) => l.toString()) : undefined
        const courseIds = await this.elasticsearchService.searchCourses({
          keyword,
          department,
          type,
          level: level_str,
          term,
          offset,
          limit,
        })

        if (courseIds.length === 0) {
          return {
            courses: [],
            totalCount: 0,
          }
        }

        // Fetch full course data from Prisma using the IDs from Elasticsearch
        // We need to fetch by IDs and then apply additional filters (like term filter)
        // First, get courses by IDs
        const coursesByIds = await this.courseRepository.getCoursesByIds(courseIds)

        // Apply term filter if needed (filter courses that have lectures in recent years)
        let filteredCourses = coursesByIds
        if (term) {
          const currentYear = new Date().getFullYear()
          const minYear = currentYear - term
          // Note: We need to check if courses have lectures in the term period
          // For now, we'll fetch all and filter in memory, but this could be optimized
          // by adding year info to the Elasticsearch index
          filteredCourses = await this.courseRepository.filterCoursesByTerm(coursesByIds, minYear)
        }

        // Apply other filters (department, type, level) that might not be fully handled by ES
        // These should already be filtered by ES, but we apply them again for safety
        let finalCourses = filteredCourses
        if (department && department.length > 0) {
          finalCourses = finalCourses.filter((c) => department.includes(c.department_id))
        }
        if (type && type.length > 0 && !type.includes('ALL')) {
          // Type filtering logic (simplified - should match ES logic)
          const typeEnMap: Record<string, string> = {
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
          if (type.includes('ETC')) {
            const selectedTypes = type.filter((t) => t !== 'ETC')
            const excludedTypes = selectedTypes.map((t) => typeEnMap[t]).filter(Boolean)
            finalCourses = finalCourses.filter((c) => !excludedTypes.includes(c.type_en || ''))
          }
          else {
            const typeEnValues = type.map((t) => typeEnMap[t]).filter(Boolean)
            finalCourses = finalCourses.filter((c) => typeEnValues.includes(c.type_en || ''))
          }
        }
        if (level && level.length > 0) {
          const levelDigits = level.map((l) => l.toString()[0])
          finalCourses = finalCourses.filter((c) => levelDigits.includes(c.level || ''))
        }

        // Maintain order from Elasticsearch results
        const orderedCourses = courseIds
          .map((id: number) => finalCourses.find((c) => c.id === id))
          .filter((c: ECourseV2.BasicWithProfessors | undefined): c is ECourseV2.BasicWithProfessors => c !== undefined)

        queryResult = orderedCourses
        totalCount = queryResult.length
      }
      catch (error) {
        // Fallback to Prisma if Elasticsearch fails
        console.error('Elasticsearch search failed, falling back to Prisma:', error)
        const prismaResult = await this.courseRepository.getCourses(
          department,
          type,
          level,
          keyword,
          term,
          order,
          offset,
          limit,
        )
        queryResult = prismaResult.queryResult
        totalCount = prismaResult.totalCount
      }
    }
    else {
      // No keyword, use Prisma directly
      const prismaResult = await this.courseRepository.getCourses(
        department,
        type,
        level,
        keyword,
        term,
        order,
        offset,
        limit,
      )
      queryResult = prismaResult.queryResult
      totalCount = prismaResult.totalCount
    }

    const userTakenCourseIds = !user ? [] : await this.courseRepository.getTakenCourseIdsByUser(user.id)

    const localizedResult = queryResult.map((course) => toICourseBasic(course, lang, userTakenCourseIds.includes(course.id)))
    return {
      courses: localizedResult,
      totalCount,
    }
  }

  // detailed version
  public async getCourseById(
    courseId: number,
    user: session_userprofile | null,
    user_language: language,
  ): Promise<ICourseV2.Detail> {
    const { course, lectures } = await this.courseRepository.getCourseById(courseId)
    // 에러 처리 : course 조회에 실패한 경우
    if (!course) {
      throw new Error('Invalid course id')
    }
    // lecture 정보 없는 course는 없다고 가정 (쿼리 확인 결과 3개가 있으나 무시)
    if (lectures.length === 0) {
      throw new Error('Invalid course id')
    }

    const userTakenLectureIds = (!user ? [] : await this.lectureRepository.getTakenLectures(user)).map((lec) => lec.id)
    const Histories: courseHistory[] = []

    // year와 semester 단위로 묶기
    for (const lec of lectures) {
      if (lec.year && lec.semester) {
        // professor 테이블에서 이름 찾아서 가져오기
        const professor_obj = await Promise.all(
          lec.subject_lecture_professors.map(async (p) => {
            const professor = await this.professorRepository.getProfessorById(p.professor_id)
            if (!professor) {
              throw new Error('Unexpected Error')
            }
            return {
              id: professor?.id,
              name:
                user_language === 'en'
                  ? (professor?.professor_name_en ?? professor?.professor_name)
                  : professor?.professor_name,
            }
          }),
        )
        const existing = Histories.find((h) => h.year === lec.year && h.semester === lec.semester)
        // year, semester가 이미 있는 경우 : 분반 (classNo)만 추가
        if (existing) {
          existing.classes.push({ professors: professor_obj, classNo: lec.class_no, lectureId: lec.id })
          if (userTakenLectureIds.includes(lec.id)) {
            existing.myLectureId = lec.id
          }
          // year, semester가 없는 경우 : 새로 추가
        }
        else {
          Histories.push({
            year: lec.year,
            semester: lec.semester,
            classes: [{ professors: professor_obj, classNo: lec.class_no, lectureId: lec.id }],
            myLectureId: userTakenLectureIds.includes(lec.id) ? lec.id : null,
          })
        }
        // year, semester가 없는 경우 : 에러
      }
      else {
        throw new Error('Unexpected Error')
      }
    }

    return {
      id: course?.id,
      name: user_language === 'en' ? fallbackEmpty(course?.title_en, course?.title) : course?.title,
      code: course?.new_code,
      type: user_language === 'en' ? fallbackEmpty(course?.type_en, course?.type) : course?.type,
      department: {
        id: course?.subject_department.id,
        // db schema 상에서 name_en이 nullable : 없으면 한국어 이름 return 하도록
        name:
          user_language === 'en'
            ? fallbackEmpty(course?.subject_department.name_en, course?.subject_department.name)
            : course?.subject_department.name,
      },
      history: Histories,
      summary: course?.summury, // @Todo : 나중에 db 필드 summary로 바꾸기
      classDuration: lectures[0]?.num_classes,
      expDuration: lectures[0]?.num_labs,
      credit: lectures[0]?.credit,
      creditAU: lectures[0]?.credit_au,
    }
  }
}
