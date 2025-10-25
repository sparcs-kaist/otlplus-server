import { Injectable } from '@nestjs/common'
import { ICourseV2 } from '@otl/server-nest/common/interfaces'
import { session_userprofile } from '@prisma/client'

import { ECourseV2 } from '@otl/prisma-client/entities'
import { CourseRepositoryV2 } from '@otl/prisma-client/repositories'

type language = 'kr' | 'en'

function toICourseBasic(c: ECourseV2.BasicWithProfessors, lang: language, completed: boolean): ICourseV2.Basic {
  return {
    id: c.id,
    name: lang === 'en' ? c.title_en : c.title,
    code: c.new_code,
    type: lang === 'en' ? c.type_en : c.type,
    department: {
      id: c.subject_department.id,
      name: lang === 'en' ? (c.subject_department.name_en ?? c.subject_department.name) : c.subject_department.name,
    },
    professors: c.subject_course_professors.map((p) => ({
      id: p.professor.id,
      name: lang === 'en' ? (p.professor.professor_name_en ?? p.professor.professor_name) : p.professor.professor_name,
    })),
    summary: c.summury, // @Todo : summary db 필드 오타 수정
    open: false, // TODO: 현재 학기 개설 여부 로직
    completed,
  }
}

@Injectable()
export class CoursesServiceV2 {
  constructor(private readonly courseRepository: CourseRepositoryV2) {}

  public async getCourses(query: ICourseV2.Query, user: session_userprofile): Promise<ICourseV2.Basic[]> {
    const {
      department, type, level, keyword, term, order, offset, limit,
    } = query
    const queryResult = await this.courseRepository.getCourses(
      department,
      type,
      level,
      keyword,
      term,
      order,
      offset,
      limit,
    )
    const lang: language = query.language === 'en' ? 'en' : 'kr'

    const userTakenCourseIds = !user ? [] : await this.courseRepository.getTakenCourseIdsByUser(user.id)

    const localizedResult = queryResult.map((course) => toICourseBasic(course, lang, userTakenCourseIds.includes(course.id)))
    return localizedResult
  }
}
