import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '@otl/scholar-sync/app.module'
import { SyncService } from '@otl/scholar-sync/modules/sync/sync.service'

import { PrismaService, SyncRepository } from '@otl/prisma-client'

// This tests on test database only. Add `DATABASE_URL` with `otlplus_test` or `otlplus` database to run this test.

const maybe = process.env.DATABASE_URL?.match(/\/(otlplus_test|otlplus)\?/) ? describe : describe.skip

// 테스트용 고유 ID (기존 데이터와 충돌 방지)
const TEST_ID_BASE = 9000000

const userData = [...Array(5).keys()].map((i) => ({
  id: TEST_ID_BASE + i + 1,
  student_id: `3000000${i}`,
  sid: `test_${i}`,
  date_joined: new Date(),
  first_name: 'test',
  last_name: 'test',
}))

const departmentData = [...Array(2).keys()].map((i) => ({
  id: TEST_ID_BASE + i + 1,
  num_id: (90 + i).toString(),
  code: `TEST${i}`,
  name: `테스트학과${i}`,
  name_en: `test_department${i}`,
  visible: true,
}))

const courseData = [...Array(2).keys()].map((i) => ({
  id: TEST_ID_BASE + i + 1,
  old_code: `${departmentData[i].code}10${i}`,
  new_code: `${departmentData[i].num_id}.1000${i}`,
  department_id: departmentData[i].id,
  type: '전공',
  type_en: 'major',
  title: `테스트과목${i}`,
  title_en: `test_subject${i}`,
  summury: '',
  grade_sum: 0,
  load_sum: 0,
  speech_sum: 0,
  review_total_weight: 0,
  grade: 0,
  load: 0,
  speech: 0,
}))

const lectureData = [...Array(2).keys()].map((i) => ({
  id: TEST_ID_BASE + i + 1,
  code: `${departmentData[i].num_id}.1000${i}`,
  new_code: `${departmentData[i].num_id}.1000${i}`,
  year: 3000,
  semester: 1,
  class_no: String.fromCharCode(65 + i),
  department_id: departmentData[i].id,
  old_code: courseData[i].old_code,
  title: courseData[i].title,
  title_en: courseData[i].title_en,
  type: courseData[i].type,
  type_en: courseData[i].type_en,
  audience: 0,
  limit: 30, // 정원 설정
  credit: 3,
  credit_au: 0,
  num_classes: 3,
  num_labs: 0,
  is_english: false,
  course_id: courseData[i].id,
  deleted: false,
  grade_sum: 0,
  load_sum: 0,
  speech_sum: 0,
  review_total_weight: 0,
  grade: 0,
  load: 0,
  speech: 0,
}))

const takenLectureData = [...Array(2).keys()].map((i) => ({
  id: TEST_ID_BASE + 100 + i + 1,
  userprofile_id: userData[i].id,
  lecture_id: lectureData[i].id,
}))

const attendBase = {
  LECTURE_YEAR: 3000,
  LECTURE_TERM: 1,
  SUBJECT_NO: lectureData[0].code,
  LECTURE_CLASS: lectureData[0].class_no,
  DEPT_ID: departmentData[0].id,
  STUDENT_NO: parseInt(userData[0].student_id),
  PROCESS_TYPE: 'I',
} as const

maybe('SyncTakenLectureService', () => {
  let service: SyncService
  let prisma: PrismaService
  let syncRepository: SyncRepository

  // 테스트 데이터만 정리하는 헬퍼 함수
  async function cleanupTestData() {
    const testUserIds = userData.map((u) => u.id)
    const testLectureIds = lectureData.map((l) => l.id)
    const testCourseIds = courseData.map((c) => c.id)
    const testDeptIds = departmentData.map((d) => d.id)

    await prisma.sync_taken_lectures.deleteMany({ where: { year: 3000, semester: 1 } })
    await prisma.session_userprofile_taken_lectures.deleteMany({ where: { userprofile_id: { in: testUserIds } } })
    await prisma.session_userprofile.deleteMany({ where: { id: { in: testUserIds } } })
    await prisma.subject_lecture_professors.deleteMany({ where: { lecture_id: { in: testLectureIds } } })
    await prisma.subject_lecture.deleteMany({ where: { id: { in: testLectureIds } } })
    await prisma.subject_course.deleteMany({ where: { id: { in: testCourseIds } } })
    await prisma.subject_department.deleteMany({ where: { id: { in: testDeptIds } } })
  }

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [],
    }).compile()

    service = module.get<SyncService>(SyncService)
    prisma = module.get<PrismaService>(PrismaService)
    syncRepository = module.get<SyncRepository>(SyncRepository)

    // 기존 테스트 데이터 정리
    await cleanupTestData()

    // 테스트 데이터 생성
    await prisma.subject_department.createMany({ data: departmentData })
    await prisma.subject_course.createMany({ data: courseData })
    await prisma.subject_lecture.createMany({ data: lectureData })
    await prisma.session_userprofile.createMany({ data: userData })
  })

  afterAll(async () => {
    await cleanupTestData()
  })

  beforeEach(async () => {
    await prisma.session_userprofile_taken_lectures.createMany({
      data: takenLectureData,
    })
  })

  afterEach(async () => {
    const testUserIds = userData.map((u) => u.id)
    await prisma.sync_taken_lectures.deleteMany({ where: { year: 3000, semester: 1 } })
    await prisma.session_userprofile_taken_lectures.deleteMany({ where: { userprofile_id: { in: testUserIds } } })
    // enrolled_count 초기화
    await prisma.subject_lecture.updateMany({
      where: { year: 3000, semester: 1 },
      data: { enrolled_count: null },
    })
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should update taken lectures', async () => {
    const result = await service.syncTakenLecture({
      year: 3000,
      semester: 1,
      attend: [
        {
          ...attendBase,
          SUBJECT_NO: lectureData[1].code,
          LECTURE_CLASS: lectureData[1].class_no,
          DEPT_ID: departmentData[1].id,
        },
      ],
    })

    const takenLectureResult = result.results[0]
    expect(takenLectureResult.updated).toHaveLength(2)
    expect(takenLectureResult.errors).toHaveLength(0)

    const user0Update = takenLectureResult.updated.find((u: any) => u.studentId.toString() === userData[0].student_id)
    expect(user0Update).toBeDefined()
    expect(user0Update.studentId).toBe(parseInt(userData[0].student_id))
    expect(user0Update.add).toEqual([lectureData[1].id])
    expect(user0Update.remove).toHaveLength(1) // ID는 auto-increment라 값 대신 길이만 확인

    const user1Update = takenLectureResult.updated.find((u: any) => u.studentId.toString() === userData[1].student_id)
    expect(user1Update).toBeDefined()
    expect(user1Update.studentId).toBe(parseInt(userData[1].student_id))
    expect(user1Update.add).toEqual([])
    expect(user1Update.remove).toHaveLength(1)

    const testUserIds = userData.map((u) => u.id)
    const takenLectures = await prisma.session_userprofile_taken_lectures.findMany({
      where: { userprofile_id: { in: testUserIds } },
    })
    expect(takenLectures).toHaveLength(1)
    expect(takenLectures[0]).toMatchObject({
      userprofile_id: userData[0].id,
      lecture_id: lectureData[1].id,
    })
  })

  it('should handle error', async () => {
    const result = await service.syncTakenLecture({
      year: 3000,
      semester: 1,
      attend: [
        {
          ...attendBase,
          SUBJECT_NO: 'invalid',
        },
      ],
    })

    const takenLectureResult = result.results[0]
    expect(takenLectureResult.errors).toHaveLength(1)
    expect(takenLectureResult.errors[0]).toMatchObject({
      student_no: parseInt(userData[0].student_id),
      attend: {
        ...attendBase,
        SUBJECT_NO: 'invalid',
      },
      error: 'lecture not found',
    })
  })

  it('should not update if no change', async () => {
    const result = await service.syncTakenLecture({
      year: 3000,
      semester: 1,
      attend: [
        {
          ...attendBase,
        },
        {
          ...attendBase,
          STUDENT_NO: parseInt(userData[1].student_id),
          SUBJECT_NO: lectureData[1].code,
          LECTURE_CLASS: lectureData[1].class_no,
          DEPT_ID: departmentData[1].id,
        },
      ],
    })

    const takenLectureResult = result.results[0]
    expect(takenLectureResult.updated).toHaveLength(0)
    expect(takenLectureResult.errors).toHaveLength(0)
  })

  describe('Enrollment Count', () => {
    it('should update enrolled_count after syncTakenLecture', async () => {
      // 3명의 학생이 lecture[0]을 수강
      await service.syncTakenLecture({
        year: 3000,
        semester: 1,
        attend: [
          { ...attendBase, STUDENT_NO: parseInt(userData[0].student_id) },
          { ...attendBase, STUDENT_NO: parseInt(userData[1].student_id) },
          { ...attendBase, STUDENT_NO: parseInt(userData[2].student_id) },
        ],
      })

      // enrolled_count가 업데이트되었는지 확인
      const lecture0 = await prisma.subject_lecture.findUnique({ where: { id: lectureData[0].id } })
      const lecture1 = await prisma.subject_lecture.findUnique({ where: { id: lectureData[1].id } })

      expect(lecture0?.enrolled_count).toBe(3)
      expect(lecture1?.enrolled_count).toBe(0) // 아무도 수강하지 않음
    })

    it('getEnrollmentCountsByLecture should return correct counts', async () => {
      // sync_taken_lectures에 직접 데이터 삽입
      await prisma.sync_taken_lectures.createMany({
        data: [
          { year: 3000, semester: 1, student_id: 1, lecture_id: lectureData[0].id },
          { year: 3000, semester: 1, student_id: 2, lecture_id: lectureData[0].id },
          { year: 3000, semester: 1, student_id: 3, lecture_id: lectureData[1].id },
        ],
      })

      const counts = await syncRepository.getEnrollmentCountsByLecture(3000, 1)

      expect(counts).toHaveLength(2)
      const lecture0Count = counts.find((c) => c.lecture_id === lectureData[0].id)
      const lecture1Count = counts.find((c) => c.lecture_id === lectureData[1].id)

      expect(lecture0Count?._count.student_id).toBe(2)
      expect(lecture1Count?._count.student_id).toBe(1)
    })

    it('updateLectureEnrollmentCounts should update enrolled_count correctly', async () => {
      const updates = [
        { lectureId: lectureData[0].id, count: 15 },
        { lectureId: lectureData[1].id, count: 25 },
      ]

      await syncRepository.updateLectureEnrollmentCounts(updates, { year: 3000, semester: 1 })

      const lecture0 = await prisma.subject_lecture.findUnique({ where: { id: lectureData[0].id } })
      const lecture1 = await prisma.subject_lecture.findUnique({ where: { id: lectureData[1].id } })

      expect(lecture0?.enrolled_count).toBe(15)
      expect(lecture1?.enrolled_count).toBe(25)
    })

    it('updateLectureEnrollmentCounts should reset to 0 for lectures not in updates', async () => {
      // 먼저 enrolled_count 설정
      await prisma.subject_lecture.update({
        where: { id: lectureData[1].id },
        data: { enrolled_count: 10 },
      })

      // lecture[0]만 업데이트 (lecture[1]은 0으로 리셋되어야 함)
      await syncRepository.updateLectureEnrollmentCounts([{ lectureId: lectureData[0].id, count: 5 }], {
        year: 3000,
        semester: 1,
      })

      const lecture0 = await prisma.subject_lecture.findUnique({ where: { id: lectureData[0].id } })
      const lecture1 = await prisma.subject_lecture.findUnique({ where: { id: lectureData[1].id } })

      expect(lecture0?.enrolled_count).toBe(5)
      expect(lecture1?.enrolled_count).toBe(0) // 리셋됨
    })

    it('updateEnrollmentCounts service method should aggregate and update', async () => {
      // sync_taken_lectures에 데이터 삽입
      await prisma.sync_taken_lectures.createMany({
        data: [
          { year: 3000, semester: 1, student_id: 1, lecture_id: lectureData[0].id },
          { year: 3000, semester: 1, student_id: 2, lecture_id: lectureData[0].id },
          { year: 3000, semester: 1, student_id: 3, lecture_id: lectureData[0].id },
          { year: 3000, semester: 1, student_id: 4, lecture_id: lectureData[1].id },
        ],
      })

      await service.updateEnrollmentCounts(3000, 1)

      const lecture0 = await prisma.subject_lecture.findUnique({ where: { id: lectureData[0].id } })
      const lecture1 = await prisma.subject_lecture.findUnique({ where: { id: lectureData[1].id } })

      expect(lecture0?.enrolled_count).toBe(3)
      expect(lecture1?.enrolled_count).toBe(1)
    })
  })
})
