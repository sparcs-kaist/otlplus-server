import { Injectable } from '@nestjs/common'
import { ILectureV2 } from '@otl/server-nest/common/interfaces'
import { session_userprofile } from '@prisma/client'

import { LectureRepositoryV2, PrismaService } from '@otl/prisma-client'

@Injectable()
export class LecturesServiceV2 {
  constructor(
    private lectureRepository: LectureRepositoryV2,
    private prisma: PrismaService,
  ) {}

  public async getLectureByFilter(
    query: ILectureV2.getQuery,
    user: session_userprofile | null,
  ): Promise<ILectureV2.courseWrapped> {
    // Helpers
    const toMinutes = (v: unknown): number => {
      if (v === null || v === undefined) return 0
      if (typeof v === 'number' && Number.isFinite(v)) return v
      if (v instanceof Date) {
        const hh = v.getUTCHours()
        const mm = v.getUTCMinutes()
        return hh * 60 + mm
      }
      const n = Number(v as any)
      return Number.isFinite(n) ? n : 0
    }
    const pad2 = (n: number) => (n < 10 ? `0${n}` : String(n))
    const mmToHHmm = (mins: number) => `${pad2(Math.floor(mins / 60))}:${pad2(mins % 60)}`
    const prefer = (a?: string | null, b?: string | null) => (a ?? '').trim() || (b ?? '').trim() || ''

    // 1) Fetch lectures matching the filter
    const {
      keyword, type, department, level, year, semester, day, begin, end, order, limit, offset,
    } = query
    const lectures = await this.lectureRepository.filterByRequest(
      keyword,
      type as unknown as string[] | undefined,
      department as unknown as number[] | undefined,
      level as unknown as string[] | undefined,
      year,
      semester,
      day,
      begin,
      end,
      order as unknown as string | undefined,
      limit,
      offset,
    )

    if (!lectures.length) {
      return { courses: [] }
    }

    // 2) Fetch metadata (classTimes, examTime, professors)
    const lectureIds = lectures.map((l) => l.id)
    const metaTuples = await this.lectureRepository.getLectureMetadataByIds(lectureIds)
    const metaById = new Map<number, { classTimes: any[], examTime: any | null, professors: any[] }>()
    for (const [id, classTimes, examTime, professors] of metaTuples) {
      metaById.set(id, { classTimes, examTime, professors })
    }

    // 3) Fetch course codes for all involved courses
    const courseIds = Array.from(new Set(lectures.map((l) => l.course_id)))
    const coursesRaw = await this.prisma.subject_course.findMany({
      where: { id: { in: courseIds } },
      select: { id: true, new_code: true },
    })
    const courseCodeById = new Map<number, string>(coursesRaw.map((c) => [c.id, c.new_code]))

    // 4) Derive user's taken course ids to mark completed
    const takenCourseIdSet = new Set<number>()
    if (user) {
      const takenLectures = await this.prisma.session_userprofile_taken_lectures.findMany({
        where: { userprofile_id: user.id },
        select: { lecture_id: true },
      })
      const tlIds = takenLectures.map((t) => t.lecture_id)
      if (tlIds.length) {
        const takenCourses = await this.prisma.subject_lecture.findMany({
          where: { id: { in: tlIds } },
          select: { course_id: true },
          distinct: ['course_id'],
        })
        takenCourses.forEach((tc) => takenCourseIdSet.add(tc.course_id))
      }
    }

    // 5) Group by course and assemble response
    type CourseGroup = { name: string, code: string, type: string, lectures: ILectureV2.Basic[], completed: boolean }
    const grouped = new Map<number, CourseGroup>()

    for (const lec of lectures) {
      const meta = metaById.get(lec.id)

      const classTimes = (meta?.classTimes ?? []).map((ct: any) => ({
        day: ct.day,
        begin: toMinutes(ct.begin),
        end: toMinutes(ct.end),
        buildingCode: String(ct.building_id ?? ''),
        buildingName: prefer(ct.building_full_name, ct.building_full_name_en),
        roomName: ct.room_name ?? '',
      }))

      const exam = meta?.examTime
      const examTime = exam
        ? ({
          day: exam.day,
          begin: toMinutes(exam.begin),
          end: toMinutes(exam.end),
          str: `${mmToHHmm(toMinutes(exam.begin))}~${mmToHHmm(toMinutes(exam.end))}`,
        } as ILectureV2.ExamTime)
        : null

      const professors = (meta?.professors ?? []).map((p: any) => ({
        id: p.id,
        name: prefer(p.professor_name, p.professor_name_en),
      }))

      const basic: ILectureV2.Basic = {
        id: lec.id,
        courseId: lec.course_id,
        classNo: String(lec.class_no ?? ''),
        name: prefer(lec.title, lec.title_en),
        code: courseCodeById.get(lec.course_id) ?? '',
        department: {
          id: lec.subject_department.id,
          name: prefer(lec.subject_department.name, lec.subject_department.name_en),
        },
        type: prefer(lec.type, lec.type_en),
        limitPeople: lec.limit ?? 0,
        numPeople: lec.num_people ?? 0,
        credit: lec.credit ?? 0,
        creditAU: lec.credit_au ?? 0,
        averageGrade: new Float32Array([Number(lec.grade ?? 0)]),
        averageLoad: new Float32Array([Number(lec.load ?? 0)]),
        averageSpeech: new Float32Array([Number(lec.speech ?? 0)]),
        isEnglish: Boolean(lec.is_english),
        professors,
        classes: classTimes,
        examTime,
      }

      const courseId = lec.course_id
      if (!grouped.has(courseId)) {
        grouped.set(courseId, {
          name: prefer(lec.title, lec.title_en),
          code: courseCodeById.get(courseId) ?? '',
          type: prefer(lec.type, lec.type_en),
          lectures: [basic],
          completed: takenCourseIdSet.has(courseId),
        })
      }
      else {
        grouped.get(courseId)!.lectures.push(basic)
      }
    }

    return { courses: Array.from(grouped.values()) }
  }
}
