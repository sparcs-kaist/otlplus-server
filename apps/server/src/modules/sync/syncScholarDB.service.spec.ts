import { Test, TestingModule } from '@nestjs/testing';
import { session_userprofile } from '@prisma/client';
import { AppModule } from '@src/app.module';
import { PrismaService } from '@src/prisma/prisma.service';
import { SyncScholarDBService } from './syncScholarDB.service';

// This tests on test database only. Add `DATABASE_URL` with `otlplus_test` database to run this test.

const maybe = process.env.DATABASE_URL?.includes('/otlplus_test?') ? describe : describe.skip;

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
  new_code: `${departmentData[i].code}.1000${i}`,
  old_code: `${departmentData[i].code}10${i}`,
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
const professorData = [...Array(2).keys()].map((i) => ({
  id: i + 1,
  professor_id: i + 1,
  professor_name: `교수${i}`,
  professor_name_en: `professor${i}`,
  major: departmentData[i].id.toString(),
  grade_sum: 0,
  load_sum: 0,
  speech_sum: 0,
  review_total_weight: 0,
  grade: 0,
  load: 0,
  speech: 0,
}));
const lectureData = [...Array(2).keys()].map((i) => ({
  id: i + 1,
  code: `${departmentData[i].num_id}:1000${i}`,
  new_code: `${departmentData[i].code}.1000${i}`,
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

const lectureBase = {
  LECTURE_YEAR: 3000,
  LECTURE_TERM: 1,
  SUBJECT_NO: lectureData[0].code,
  LECTURE_CLASS: lectureData[0].class_no + ' ',
  DEPT_ID: departmentData[0].id,
  DEPT_NAME: departmentData[0].name,
  E_DEPT_NAME: departmentData[0].name_en,
  SUB_TITLE: lectureData[0].title,
  E_SUB_TITLE: lectureData[0].title_en,
  SUBJECT_ID: 0,
  SUBJECT_TYPE: '전공',
  E_SUBJECT_TYPE: 'major',
  COURSE_SECT: 0,
  ACT_UNIT: 0,
  LECTURE: 3,
  LAB: 0,
  CREDIT: 3,
  LIMIT: 0,
  PROF_NAMES: '교수0',
  NOTICE: '',
  OLD_NO: lectureData[0].old_code,
  ENGLISH_LEC: 'N' as const,
  E_PROF_NAMES: 'professor0',
};

const classtimeData = [...Array(1).keys()]
  .map((i) => [
    {
      id: 2 * i + 1,
      lecture_id: lectureData[i].id,
      day: 0,
      begin: new Date('1970-01-01T09:00:00Z'),
      end: new Date('1970-01-01T10:30:00Z'),
      type: 'l',
      building_id: '301',
      building_full_name: '(E11)창의학습관',
      building_full_name_en: '(E11)Creative Learning Bldg.',
      room_name: '304',
      unit_time: 1,
    },
    {
      id: 2 * i + 2,
      lecture_id: lectureData[i].id,
      day: 2,
      begin: new Date('1970-01-01T09:00:00Z'),
      end: new Date('1970-01-01T10:30:00Z'),
      type: 'l',
      building_id: '301',
      building_full_name: '(E11)창의학습관',
      building_full_name_en: '(E11)Creative Learning Bldg.',
      room_name: '304',
      unit_time: 1,
    },
  ])
  .flat();

const classtimeBase = {
  LECTURE_YEAR: 3000,
  LECTURE_TERM: 1,
  SUBJECT_NO: lectureData[0].code,
  LECTURE_CLASS: lectureData[0].class_no + ' ',
  DEPT_ID: lectureData[0].department_id,
  LECTURE_DAY: 1,
  LECTURE_BEGIN: '1900-01-01 09:00:00.0',
  LECTURE_END: '1900-01-01 10:30:00.0',
  LECTURE_TYPE: 'l',
  BUILDING: 301,
  ROOM_NO: '304',
  ROOM_K_NAME: '(E11)창의학습관',
  ROOM_E_NAME: '(E11)Creative Learning Bldg.',
  TEACHING: 1,
} as const;

const examtimeData = [...Array(1).keys()].map((i) => ({
  id: i + 1,
  lecture_id: lectureData[i].id,
  day: 0,
  begin: new Date('1970-01-01T09:00:00Z'),
  end: new Date('1970-01-01T12:00:00Z'),
}));

const examtimeBase = {
  LECTURE_YEAR: 3000,
  LECTURE_TERM: 1,
  SUBJECT_NO: lectureData[0].code,
  LECTURE_CLASS: lectureData[0].class_no + ' ',
  DEPT_ID: lectureData[0].department_id,
  EXAM_DAY: 1,
  EXAM_BEGIN: '1900-01-01 09:00:00.0',
  EXAM_END: '1900-01-01 12:00:00.0',
  NOTICE: '',
} as const;

maybe('SyncScholarDBService', () => {
  let service: SyncScholarDBService;
  let prisma: PrismaService;
  let users: session_userprofile[];
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [],
    }).compile();

    service = module.get<SyncScholarDBService>(SyncScholarDBService);
    prisma = module.get<PrismaService>(PrismaService);

    const userData = [...Array(5).keys()].map((i) => ({
      student_id: `3000000${i}`,
      sid: i.toString(),
      date_joined: new Date(),
      first_name: 'test',
      last_name: 'test',
    }));

    await prisma.session_userprofile.deleteMany();
    await prisma.session_userprofile.createMany({ data: userData });
    users = await prisma.session_userprofile.findMany();
  });

  afterAll(async () => {
    await prisma.session_userprofile.deleteMany();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  function checkNoError(result: any) {
    if (result.departments.errors.length > 0) console.error(result.departments.errors);
    if (result.courses.errors.length > 0) console.error(result.courses.errors);
    if (result.lectures.errors.length > 0) console.error(result.lectures.errors);
    if (result.professors.errors.length > 0) console.error(result.professors.errors);
    expect(result.departments.errors.length).toBe(0);
    expect(result.courses.errors.length).toBe(0);
    expect(result.lectures.errors.length).toBe(0);
    expect(result.professors.errors.length).toBe(0);
  }

  describe('syncScholarDB', () => {
    beforeEach(async () => {
      await prisma.subject_lecture_professors.deleteMany();
      await prisma.subject_lecture.deleteMany();
      await prisma.subject_course.deleteMany();
      await prisma.subject_professor.deleteMany();
      await prisma.subject_department.deleteMany();

      await prisma.subject_department.createMany({ data: departmentData });
      await prisma.subject_course.createMany({ data: courseData });
      await prisma.subject_professor.createMany({ data: professorData });
      await prisma.subject_lecture.createMany({ data: lectureData });
    });

    afterEach(async () => {
      await prisma.subject_lecture_professors.deleteMany();
      await prisma.subject_lecture.deleteMany();
      await prisma.subject_course.deleteMany();
      await prisma.subject_professor.deleteMany();
      await prisma.subject_department.deleteMany();
    });

    it('should create a new department if not exists', async () => {
      const result = await service.syncScholarDB({
        year: 3000,
        semester: 1,
        lectures: [
          {
            ...lectureBase,
            DEPT_ID: 10,
            DEPT_NAME: '학과10',
            OLD_NO: 'K100',
            E_DEPT_NAME: 'department10',
          },
        ],
        charges: [],
      });

      expect(result.departments.created.length).toBe(1);
      checkNoError(result);

      const department = await prisma.subject_department.findFirst({
        where: { id: 10 },
      });
      expect(department).toMatchObject({
        id: 10,
        code: 'K',
        name: '학과10',
        name_en: 'department10',
        visible: true,
      });
    });

    it('should update an existing department if changes are detected', async () => {
      const result = await service.syncScholarDB({
        year: 3000,
        semester: 1,
        lectures: [
          {
            ...lectureBase,
            DEPT_ID: departmentData[0].id,
            DEPT_NAME: '학과0_Updated',
            OLD_NO: 'AA100',
            E_DEPT_NAME: 'department0_Updated',
          },
        ],
        charges: [],
      });

      expect(result.departments.updated.length).toBe(1);
      checkNoError(result);

      const department = await prisma.subject_department.findFirst({
        where: { id: departmentData[0].id },
      });

      expect(department).toMatchObject({
        id: departmentData[0].id,
        code: 'AA',
        name: '학과0_Updated',
        name_en: 'department0_Updated',
        visible: true,
      });
    });

    it('should handle course creation', async () => {
      const result = await service.syncScholarDB({
        year: 3000,
        semester: 1,
        lectures: [
          {
            ...lectureBase,
            SUBJECT_NO: `${departmentData[0].num_id}.200`,
            OLD_NO: `${departmentData[0].code}200`,
            DEPT_ID: departmentData[0].id,
            SUB_TITLE: '새 과목',
            E_SUB_TITLE: 'New Course EN',
          },
        ],
        charges: [],
      });

      expect(result.courses.created.length).toBe(1);
      checkNoError(result);

      const course = await prisma.subject_course.findFirst({
        where: { old_code: `${departmentData[0].code}200` },
      });

      expect(course).toMatchObject({
        department_id: departmentData[0].id,
        title: '새 과목',
        title_en: 'New Course EN',
      });
    });

    it('should handle course update', async () => {
      const existingLecture = lectureData[0];

      const result = await service.syncScholarDB({
        year: 3000,
        semester: 1,
        lectures: [
          {
            ...lectureBase,
            SUBJECT_NO: existingLecture.code,
            OLD_NO: existingLecture.old_code,
            DEPT_ID: existingLecture.department_id,
            SUB_TITLE: '수정된 과목',
            E_SUB_TITLE: 'Updated Course EN',
          },
        ],
        charges: [],
      });

      expect(result.courses.updated.length).toBe(1);
      checkNoError(result);

      const updatedCourse = await prisma.subject_course.findFirst({
        where: { old_code: existingLecture.old_code },
      });

      expect(updatedCourse).toMatchObject({
        department_id: existingLecture.department_id,
        title: '수정된 과목',
        title_en: 'Updated Course EN',
      });
    });

    it('should handle lecture creation', async () => {
      const existingCourse = courseData[0]; // Use the first course from courseData

      const result = await service.syncScholarDB({
        year: 3000,
        semester: 1,
        lectures: [
          {
            ...lectureBase,
            SUBJECT_NO: departmentData[0].code + '.200', // Use the same department code as the existing course
            OLD_NO: existingCourse.old_code,
            DEPT_ID: existingCourse.department_id,
            SUB_TITLE: `${existingCourse.title}<new>`,
            E_SUB_TITLE: `${existingCourse.title_en}<new>`,
            LECTURE_CLASS: 'Z', // Set a new class number
          },
        ],
        charges: [],
      });

      expect(result.lectures.updated.length).toBe(0);
      expect(result.lectures.created.length).toBe(1);
      checkNoError(result);

      const lecture = await prisma.subject_lecture.findFirst({
        where: {
          code: `${existingCourse.old_code.split('10')[0]}.200`,
          class_no: 'Z',
        },
      });

      expect(lecture).toBeDefined();
      expect(lecture).toMatchObject({
        department_id: existingCourse.department_id,
        title: `${existingCourse.title}<new>`,
        title_en: `${existingCourse.title_en}<new>`,
        class_no: 'Z',
      });
    });

    it('should handle lecture update', async () => {
      const existingLecture = lectureData[0]; // Use the first lecture from lectureData

      const result = await service.syncScholarDB({
        year: 3000,
        semester: 1,
        lectures: [
          {
            ...lectureBase,
            SUBJECT_NO: existingLecture.code,
            OLD_NO: existingLecture.old_code,
            DEPT_ID: existingLecture.department_id,
            SUB_TITLE: '수정된 강의',
            E_SUB_TITLE: 'Updated Lecture EN',
            LECTURE_CLASS: existingLecture.class_no, // Use the existing class number
          },
        ],
        charges: [],
      });

      expect(result.lectures.updated.length).toBe(1);
      expect(result.lectures.updated.length).toBe(1);
      checkNoError(result);

      const updatedLecture = await prisma.subject_lecture.findFirst({
        where: {
          code: existingLecture.code,
          class_no: existingLecture.class_no,
        },
      });

      expect(updatedLecture).toMatchObject({
        department_id: existingLecture.department_id,
        title: '수정된 강의',
        title_en: 'Updated Lecture EN',
        class_no: existingLecture.class_no,
      });
    });

    it('should handle lecture removal', async () => {
      const existingLecture = lectureData[0]; // Use the first lecture from lectureData

      const result = await service.syncScholarDB({
        year: 3000,
        semester: 1,
        lectures: [],
        charges: [],
      });

      expect(result.lectures.deleted.length).toBe(lectureData.length);
      checkNoError(result);

      const deletedLectureCount = await prisma.subject_lecture.count({
        where: { deleted: true },
      });
      expect(deletedLectureCount).toBe(lectureData.length);
    });

    it('should handle professor creation', async () => {
      const existingLecture = lectureData[0]; // Use the first lecture from lectureData

      const result = await service.syncScholarDB({
        year: 3000,
        semester: 1,
        lectures: [lectureBase],
        charges: [
          {
            LECTURE_YEAR: existingLecture.year,
            LECTURE_TERM: existingLecture.semester,
            SUBJECT_NO: existingLecture.code,
            LECTURE_CLASS: existingLecture.class_no,
            DEPT_ID: existingLecture.department_id,
            PROF_ID: 999, // New professor ID
            PROF_NAME: 'New Professor',
            PORTION: 3,
            E_PROF_NAME: 'New Professor EN',
          },
        ],
      });

      expect(result.professors.created.length).toBe(1);
      checkNoError(result);

      const professor = await prisma.subject_professor.findFirst({
        where: { professor_id: 999 },
      });

      expect(professor).toMatchObject({
        professor_name: 'New Professor',
        professor_name_en: 'New Professor EN',
        major: existingLecture.department_id.toString(),
      });
    });

    it('should handle professor update', async () => {
      const existingLecture = lectureData[0]; // Use the first lecture from lectureData
      const existingProfessor = professorData[0]; // Use the first professor from professorData

      const result = await service.syncScholarDB({
        year: 3000,
        semester: 1,
        lectures: [lectureBase],
        charges: [
          {
            LECTURE_YEAR: existingLecture.year,
            LECTURE_TERM: existingLecture.semester,
            SUBJECT_NO: existingLecture.code,
            LECTURE_CLASS: existingLecture.class_no,
            DEPT_ID: existingLecture.department_id,
            PROF_ID: existingProfessor.professor_id, // Existing professor ID
            PROF_NAME: 'Updated Professor',
            PORTION: 3,
            E_PROF_NAME: 'Updated Professor EN',
          },
        ],
      });

      expect(result.professors.updated.length).toBe(1);
      checkNoError(result);

      const updatedProfessor = await prisma.subject_professor.findFirst({
        where: { professor_id: existingProfessor.professor_id },
      });

      expect(updatedProfessor).toMatchObject({
        professor_name: 'Updated Professor',
        professor_name_en: 'Updated Professor EN',
        major: existingLecture.department_id.toString(),
      });
    });

    it('should handle lecture professor change', async () => {
      const existingLecture = lectureData[0]; // Use the first lecture from lectureData
      const existingProfessor = professorData[1]; // Use the first professor from professorData

      await prisma.subject_lecture_professors.create({
        data: {
          lecture_id: existingLecture.id,
          professor_id: professorData[0].id,
        },
      });

      const result = await service.syncScholarDB({
        year: 3000,
        semester: 1,
        lectures: [lectureBase],
        charges: [
          {
            LECTURE_YEAR: existingLecture.year,
            LECTURE_TERM: existingLecture.semester,
            SUBJECT_NO: existingLecture.code,
            LECTURE_CLASS: existingLecture.class_no,
            DEPT_ID: parseInt(existingProfessor.major),
            PROF_ID: existingProfessor.professor_id, // Existing professor ID
            PROF_NAME: existingProfessor.professor_name,
            PORTION: 3,
            E_PROF_NAME: existingProfessor.professor_name_en,
          },
        ],
      });

      expect(result.professors.updated.length).toBe(0);
      expect(result.professors.created.length).toBe(0);
      expect(result.lectures.updated.length).toBe(0);
      expect(result.lectures.chargeUpdated.length).toBe(1);
      checkNoError(result);

      expect(result.lectures.chargeUpdated[0]).toMatchObject({
        added: [{ id: professorData[1].id }],
        removed: [{ id: professorData[0].id }],
      });
    });
  });

  describe('sync classtime', () => {
    beforeAll(async () => {
      await prisma.subject_lecture_professors.deleteMany();
      await prisma.subject_lecture.deleteMany();
      await prisma.subject_course.deleteMany();
      await prisma.subject_professor.deleteMany();
      await prisma.subject_department.deleteMany();

      await prisma.subject_department.createMany({ data: departmentData });
      await prisma.subject_course.createMany({ data: courseData });
      await prisma.subject_professor.createMany({ data: professorData });
      await prisma.subject_lecture.createMany({ data: lectureData });
    });

    afterAll(async () => {
      await prisma.subject_lecture_professors.deleteMany();
      await prisma.subject_lecture.deleteMany();
      await prisma.subject_course.deleteMany();
      await prisma.subject_professor.deleteMany();
      await prisma.subject_department.deleteMany();
    });

    beforeEach(async () => {
      await prisma.subject_classtime.deleteMany();

      await prisma.subject_classtime.createMany({ data: classtimeData });
    });

    afterEach(async () => {
      await prisma.subject_classtime.deleteMany();
    });

    it('should handle classtime creation & deletion', async () => {
      const existingLecture = lectureData[1]; // Use the second lecture from lectureData

      const result = await service.syncClassTime({
        year: 3000,
        semester: 1,
        classtimes: [
          {
            ...classtimeBase,
            SUBJECT_NO: existingLecture.code,
            LECTURE_CLASS: existingLecture.class_no,
            DEPT_ID: existingLecture.department_id,
            LECTURE_DAY: 2,
            LECTURE_BEGIN: '1900-01-01 13:00:00.0',
            LECTURE_END: '1900-01-01 14:30:00.0',
          },
        ],
      });

      expect(result.updated.length).toBe(2);
      expect(result.updated.filter((l: any) => l.lecture === existingLecture.code)[0].added.length).toBe(1);
      expect(result.updated.filter((l: any) => l.lecture === lectureData[0].code)[0].removed.length).toBe(2);

      const classtime = await prisma.subject_classtime.findFirst({
        where: { lecture_id: existingLecture.id },
      });

      expect(classtime).toMatchObject({
        day: 1,
        begin: new Date('1970-01-01T13:00:00Z'),
        end: new Date('1970-01-01T14:30:00Z'),
        building_id: '301',
      });
    });

    it('should handle classtime update', async () => {
      const existingLecture = lectureData[0]; // Use the first lecture

      const result = await service.syncClassTime({
        year: 3000,
        semester: 1,
        classtimes: [
          {
            ...classtimeBase,
            SUBJECT_NO: existingLecture.code,
            LECTURE_CLASS: existingLecture.class_no,
            DEPT_ID: existingLecture.department_id,
            LECTURE_DAY: 2,
            LECTURE_BEGIN: '1900-01-01 14:00:00.0',
            LECTURE_END: '1900-01-01 15:30:00.0',
          },
        ],
      });

      expect(result.updated.length).toBe(1);
      expect(result.updated[0].added.length).toBe(1);
      expect(result.updated[0].removed.length).toBe(2);

      const updatedClasstime = await prisma.subject_classtime.findFirst({});

      expect(updatedClasstime).toMatchObject({
        day: 1,
        begin: new Date('1970-01-01T14:00:00Z'),
        end: new Date('1970-01-01T15:30:00Z'),
      });
    });

    it('should not update classtime if no changes are detected', async () => {
      const existingLecture = lectureData[0]; // Use the first lecture

      const result = await service.syncClassTime({
        year: 3000,
        semester: 1,
        classtimes: [
          {
            ...classtimeBase,
            LECTURE_DAY: 1,
            LECTURE_BEGIN: '1900-01-01 09:00:00.0',
            LECTURE_END: '1900-01-01 10:30:00.0',
          },
          {
            ...classtimeBase,
            LECTURE_DAY: 3,
            LECTURE_BEGIN: '1900-01-01 09:00:00.0',
            LECTURE_END: '1900-01-01 10:30:00.0',
          },
        ],
      });

      expect(result.updated.length).toBe(0);
    });
  });

  describe('sync examtime', () => {
    beforeAll(async () => {
      await prisma.subject_lecture_professors.deleteMany();
      await prisma.subject_lecture.deleteMany();
      await prisma.subject_course.deleteMany();
      await prisma.subject_professor.deleteMany();
      await prisma.subject_department.deleteMany();

      await prisma.subject_department.createMany({ data: departmentData });
      await prisma.subject_course.createMany({ data: courseData });
      await prisma.subject_professor.createMany({ data: professorData });
      await prisma.subject_lecture.createMany({ data: lectureData });
    });

    afterAll(async () => {
      await prisma.subject_lecture_professors.deleteMany();
      await prisma.subject_lecture.deleteMany();
      await prisma.subject_course.deleteMany();
      await prisma.subject_professor.deleteMany();
      await prisma.subject_department.deleteMany();
    });

    beforeEach(async () => {
      await prisma.subject_examtime.deleteMany();

      await prisma.subject_examtime.createMany({ data: examtimeData });
    });

    afterEach(async () => {
      await prisma.subject_examtime.deleteMany();
    });

    it('should handle examtime creation & deletion', async () => {
      const existingLecture = lectureData[1]; // Use the second lecture from lectureData

      const result = await service.syncExamtime({
        year: 3000,
        semester: 1,
        examtimes: [
          {
            ...examtimeBase,
            SUBJECT_NO: existingLecture.code,
            LECTURE_CLASS: existingLecture.class_no,
            DEPT_ID: existingLecture.department_id,
            EXAM_DAY: 2,
            EXAM_BEGIN: '1900-01-01 13:00:00.0',
            EXAM_END: '1900-01-01 14:30:00.0',
          },
        ],
      });

      expect(result.updated.length).toBe(2);
      expect(result.updated.filter((l: any) => l.lecture === existingLecture.code)[0].added.length).toBe(1);
      expect(result.updated.filter((l: any) => l.lecture === lectureData[0].code)[0].removed.length).toBe(1);

      const examtime = await prisma.subject_examtime.findFirst({
        where: { lecture_id: existingLecture.id },
      });

      expect(examtime).toMatchObject({
        day: 1,
        begin: new Date('1970-01-01T13:00:00Z'),
        end: new Date('1970-01-01T14:30:00Z'),
      });
    });

    it('should handle examtime update', async () => {
      const existingLecture = lectureData[0]; // Use the first lecture

      const result = await service.syncExamtime({
        year: 3000,
        semester: 1,
        examtimes: [
          {
            ...examtimeBase,
            SUBJECT_NO: existingLecture.code,
            LECTURE_CLASS: existingLecture.class_no,
            DEPT_ID: existingLecture.department_id,
            EXAM_DAY: 2,
            EXAM_BEGIN: '1900-01-01 14:00:00.0',
            EXAM_END: '1900-01-01 15:30:00.0',
          },
        ],
      });

      expect(result.updated.length).toBe(1);
      expect(result.updated[0].added.length).toBe(1);
      expect(result.updated[0].removed.length).toBe(1);

      const updatedExamtime = await prisma.subject_examtime.findFirst({});

      expect(updatedExamtime).toMatchObject({
        day: 1,
        begin: new Date('1970-01-01T14:00:00Z'),
        end: new Date('1970-01-01T15:30:00Z'),
      });
    });

    it('should not update examtime if no changes are detected', async () => {
      const result = await service.syncExamtime({
        year: 3000,
        semester: 1,
        examtimes: [
          {
            ...examtimeBase,
            EXAM_DAY: 1,
            EXAM_BEGIN: '1900-01-01 09:00:00.0',
            EXAM_END: '1900-01-01 12:00:00.0',
          },
        ],
      });

      expect(result.updated.length).toBe(0);
    });
  });
});
