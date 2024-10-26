import { Test, TestingModule } from '@nestjs/testing';
import { session_userprofile } from '@prisma/client';
import { AppModule } from '@src/app.module';
import { PrismaService } from '@src/prisma/prisma.service';
import { SyncScholarDBService } from './syncScholarDB.service';

const maybe = process.env.DATABASE_URL?.includes('/otlplus_test?')
  ? describe
  : describe.skip;

const departmentData = [...Array(5).keys()].map((i) => ({
  id: i + 1,
  num_id: (10 + i).toString(),
  code: String.fromCharCode(65 + i),
  name: `학과${i}`,
  name_en: `department${i}`,
  visible: true,
}));
const courseData = [...Array(5).keys()].map((i) => ({
  id: i + 1,
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
const professorData = [...Array(5).keys()].map((i) => ({
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
const lectureData = [...Array(5).keys()].map((i) => ({
  id: i + 1,
  code: `${departmentData[i].num_id}:10${i}`,
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
  lecture_year: 3000,
  lecture_term: 1,
  subject_no: lectureData[0].code,
  lecture_class: lectureData[0].class_no + ' ',
  dept_id: departmentData[0].id,
  dept_name: departmentData[0].name,
  e_dept_name: departmentData[0].name_en,
  sub_title: lectureData[0].title,
  e_sub_title: lectureData[0].title_en,
  subject_id: 0,
  subject_type: '전공',
  e_subject_type: 'major',
  course_sect: 0,
  act_unit: 0,
  lecture: 3,
  lab: 0,
  credit: 3,
  limit: 0,
  prof_names: '교수0',
  notice: '',
  old_no: lectureData[0].old_code,
  english_lec: 'N' as const,
  e_prof_names: 'professor0',
};

maybe('SyncScholarDBService', () => {
  let service: SyncScholarDBService;
  let prisma: PrismaService;
  let consoleInfoSpy: jest.SpyInstance;
  let users: session_userprofile[];
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [],
    }).compile();

    service = module.get<SyncScholarDBService>(SyncScholarDBService);
    prisma = module.get<PrismaService>(PrismaService);
    // consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});

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

  afterEach(() => {
    // consoleInfoSpy.mockClear();
  });

  afterAll(async () => {
    // consoleInfoSpy.mockRestore();

    await prisma.session_userprofile.deleteMany();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

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
            dept_id: 10,
            dept_name: '학과10',
            old_no: 'K100',
            e_dept_name: 'department10',
          },
        ],
        charges: [],
      });

      expect(result.departments.created.length).toBe(1);

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
            dept_id: departmentData[0].id,
            dept_name: '학과0_Updated',
            old_no: 'AA100',
            e_dept_name: 'department0_Updated',
          },
        ],
        charges: [],
      });

      expect(result.departments.updated.length).toBe(1);

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
            subject_no: `${departmentData[0].num_id}.200`,
            old_no: `${departmentData[0].code}200`,
            dept_id: departmentData[0].id,
            sub_title: '새 과목',
            e_sub_title: 'New Course EN',
          },
        ],
        charges: [],
      });

      expect(result.courses.created.length).toBe(1);

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
            subject_no: existingLecture.code,
            old_no: existingLecture.old_code,
            dept_id: existingLecture.department_id,
            sub_title: '수정된 과목',
            e_sub_title: 'Updated Course EN',
          },
        ],
        charges: [],
      });

      expect(result.courses.updated.length).toBe(1);

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
            subject_no: departmentData[0].code + '.200', // Use the same department code as the existing course
            old_no: existingCourse.old_code,
            dept_id: existingCourse.department_id,
            sub_title: `${existingCourse.title}<new>`,
            e_sub_title: `${existingCourse.title_en}<new>`,
            lecture_class: 'Z', // Set a new class number
          },
        ],
        charges: [],
      });

      expect(result.lectures.updated.length).toBe(0);
      expect(result.lectures.created.length).toBe(1);

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
            subject_no: existingLecture.code,
            old_no: existingLecture.old_code,
            dept_id: existingLecture.department_id,
            sub_title: '수정된 강의',
            e_sub_title: 'Updated Lecture EN',
            lecture_class: existingLecture.class_no, // Use the existing class number
          },
        ],
        charges: [],
      });

      expect(result.lectures.updated.length).toBe(1);
      expect(result.lectures.updated.length).toBe(1);

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

      expect(result.lectures.deleted.length).toBe(5);

      const deletedLectureCount = await prisma.subject_lecture.count({
        where: { deleted: true },
      });
      expect(deletedLectureCount).toBe(5);
    });

    it('should handle professor creation', async () => {
      const existingLecture = lectureData[0]; // Use the first lecture from lectureData

      const result = await service.syncScholarDB({
        year: 3000,
        semester: 1,
        lectures: [lectureBase],
        charges: [
          {
            lecture_year: existingLecture.year,
            lecture_term: existingLecture.semester,
            subject_no: existingLecture.code,
            lecture_class: existingLecture.class_no,
            dept_id: existingLecture.department_id,
            prof_id: 999, // New professor ID
            prof_name: 'New Professor',
            portion: 3,
            e_prof_name: 'New Professor EN',
          },
        ],
      });

      expect(result.professors.created.length).toBe(1);

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
            lecture_year: existingLecture.year,
            lecture_term: existingLecture.semester,
            subject_no: existingLecture.code,
            lecture_class: existingLecture.class_no,
            dept_id: existingLecture.department_id,
            prof_id: existingProfessor.professor_id, // Existing professor ID
            prof_name: 'Updated Professor',
            portion: 3,
            e_prof_name: 'Updated Professor EN',
          },
        ],
      });

      expect(result.professors.updated.length).toBe(1);

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
            lecture_year: existingLecture.year,
            lecture_term: existingLecture.semester,
            subject_no: existingLecture.code,
            lecture_class: existingLecture.class_no,
            dept_id: parseInt(existingProfessor.major),
            prof_id: existingProfessor.professor_id, // Existing professor ID
            prof_name: existingProfessor.professor_name,
            portion: 3,
            e_prof_name: existingProfessor.professor_name_en,
          },
        ],
      });

      console.log(result.professors.updated);
      console.log(result.lectures.updated);
      console.log(result.lectures.chargeUpdated[0]);

      expect(result.professors.updated.length).toBe(0);
      expect(result.professors.created.length).toBe(0);
      expect(result.lectures.updated.length).toBe(0);
      expect(result.lectures.chargeUpdated.length).toBe(1);

      expect(result.lectures.chargeUpdated[0]).toMatchObject({
        added: [{ id: professorData[1].id }],
        removed: [{ id: professorData[0].id }],
      });
    });
  });
});
