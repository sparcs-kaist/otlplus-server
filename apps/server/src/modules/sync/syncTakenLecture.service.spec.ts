import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@otl/server-nest/app.module';
import { PrismaService } from '../prisma/prisma.service';
import { SyncTakenLectureService } from './syncTakenLecture.service';

// This tests on test database only. Add `DATABASE_URL` with `otlplus_test` database to run this test.

const maybe = process.env.DATABASE_URL?.includes('/otlplus_test?') ? describe : describe.skip;

const userData = [...Array(5).keys()].map((i) => ({
  id: i + 1,
  student_id: `3000000${i}`,
  sid: i.toString(),
  date_joined: new Date(),
  first_name: 'test',
  last_name: 'test',
}));

const departmentData = [...Array(2).keys()].map((i) => ({
  id: i + 1,
  num_id: (10 + i).toString(),
  code: String.fromCharCode(65 + i),
  name: `학과${i}`,
  name_en: `department${i}`,
  visible: true,
}));
const courseData = [...Array(2).keys()].map((i) => ({
  id: i + 1,
  old_code: `${departmentData[i].code}10${i}`,
  new_code: `${departmentData[i].num_id}.1000${i}`,
  department_id: departmentData[i].id,
  type: '전공',
  type_en: 'major',
  title: `과목 ${i}`,
  title_en: `subject ${i}`,
  summury: '',
  grade_sum: 0,
  load_sum: 0,
  speech_sum: 0,
  review_total_weight: 0,
  grade: 0,
  load: 0,
  speech: 0,
  title_no_space: `과목${i}`,
  title_en_no_space: `subject${i}`,
}));

const lectureData = [...Array(2).keys()].map((i) => ({
  id: i + 1,
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
  limit: 0,
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
  title_no_space: courseData[i].title_no_space,
  title_en_no_space: courseData[i].title_en_no_space,
}));

const takenLectureData = [...Array(2).keys()].map((i) => ({
  id: i + 1,
  userprofile_id: userData[i].id,
  lecture_id: lectureData[i].id,
}));

const attendBase = {
  LECTURE_YEAR: 3000,
  LECTURE_TERM: 1,
  SUBJECT_NO: lectureData[0].code,
  LECTURE_CLASS: lectureData[0].class_no,
  DEPT_ID: departmentData[0].id,
  STUDENT_NO: parseInt(userData[0].student_id),
  PROCESS_TYPE: 'I',
} as const;

maybe('SyncTakenLectureService', () => {
  let service: SyncTakenLectureService;
  let prisma: PrismaService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [],
    }).compile();

    service = module.get<SyncTakenLectureService>(SyncTakenLectureService);
    prisma = module.get<PrismaService>(PrismaService);

    await prisma.session_userprofile_taken_lectures.deleteMany();
    await prisma.session_userprofile.deleteMany();
    await prisma.subject_lecture_professors.deleteMany();
    await prisma.subject_lecture.deleteMany();
    await prisma.subject_course.deleteMany();
    await prisma.subject_department.deleteMany();

    await prisma.session_userprofile.createMany({ data: userData });
    await prisma.subject_department.createMany({ data: departmentData });
    await prisma.subject_course.createMany({ data: courseData });
    await prisma.subject_lecture.createMany({ data: lectureData });
  });

  afterAll(async () => {
    await prisma.session_userprofile_taken_lectures.deleteMany();
    await prisma.session_userprofile.deleteMany();
    await prisma.subject_lecture_professors.deleteMany();
    await prisma.subject_lecture.deleteMany();
    await prisma.subject_course.deleteMany();
    await prisma.subject_department.deleteMany();
  });

  beforeEach(async () => {
    await prisma.session_userprofile_taken_lectures.createMany({
      data: takenLectureData,
    });
  });

  afterEach(async () => {
    await prisma.session_userprofile_taken_lectures.deleteMany();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

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
    });

    expect(result.updated).toHaveLength(2);
    expect(result.errors).toHaveLength(0);
    expect(result.updated.filter((u: any) => u.studentId.toString() === userData[0].student_id)[0]).toMatchObject({
      studentId: parseInt(userData[0].student_id),
      add: [lectureData[1].id],
      remove: [takenLectureData[0].id],
    });
    expect(result.updated.filter((u: any) => u.studentId.toString() === userData[1].student_id)[0]).toMatchObject({
      studentId: parseInt(userData[1].student_id),
      add: [],
      remove: [takenLectureData[1].id],
    });

    const takenLectures = await prisma.session_userprofile_taken_lectures.findMany();
    expect(takenLectures).toHaveLength(1);
    expect(takenLectures[0]).toMatchObject({
      userprofile_id: 1,
      lecture_id: 2,
    });
  });

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
    });

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toMatchObject({
      student_no: parseInt(userData[0].student_id),
      attend: {
        ...attendBase,
        SUBJECT_NO: 'invalid',
      },
      error: 'lecture not found',
    });
  });

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
    });

    expect(result.updated).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });
});
