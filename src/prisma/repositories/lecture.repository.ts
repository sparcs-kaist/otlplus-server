import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { Prisma, session_userprofile } from "@prisma/client";
import { groupBy } from "../../common/utils/method.utils";
import { LectureQueryDTO } from "src/common/interfaces/dto/lecture/lecture.query.dto";
import { CourseRepository } from "./course.repository";
import { applyOrder, applyOffset } from "src/common/utils/search.utils";
import { subject_lecture } from "../generated/prisma-class/subject_lecture";

@Injectable()
export class LectureRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly courseRepository: CourseRepository
  ) {}

  async filterByRequest(query: LectureQueryDTO): Promise<subject_lecture[]> {
    const DEFAULT_LIMIT = 300;
    const DEFAULT_ORDER = ['year', 'semester', 'old_code', 'class_no'];
    const researchTypes = ["Individual Study", "Thesis Study(Undergraduate)",
    "Thesis Research(MA/phD)"];
    
    const semesterFilter = this.semesterFilter(query?.year, query?.semester);
    const timeFilter = this.timeFilter(query?.day, query?.begin, query?.end);
    const departmentFilter = this.courseRepository.departmentFilter(query?.department);
    const typeFilter = this.courseRepository.typeFilter(query?.type);
    const groupFilter = this.courseRepository.groupFilter(query?.group);
    const keywordFilter = this.courseRepository.keywordFilter(query?.keyword, false);
    const defaultFilter = {
      AND: [
        {
          deleted: false,
        },
        {
          type_en: {
            notIn: researchTypes
          }
        }
      ]
    }

    const filters = [semesterFilter, timeFilter,
      departmentFilter, typeFilter, groupFilter, keywordFilter, defaultFilter];
    const queryResult = await this.prisma.subject_lecture.findMany({
      include: {
        subject_department: true,
        subject_lecture_professors: { include: { professor: true } },
        subject_classtime: true,
        subject_examtime: true,
      },
      where: {
        AND: filters.filter((filter) => filter !== null)
      },
      take: query.limit ?? DEFAULT_LIMIT,
    }) as subject_lecture[];
    const levelFilteredResult = this.courseRepository.levelFilter(queryResult, query?.level) as subject_lecture[];

    const orderedQuery = applyOrder<subject_lecture>(levelFilteredResult, query.order ?? DEFAULT_ORDER);
    return applyOffset<subject_lecture>(orderedQuery, query.offset ?? 0);
  }

  async findReviewWritableLectures(user: session_userprofile, date?: Date): Promise<subject_lecture[]> {
    let currDate;
    if (!date) {
      currDate = Date.now();
    } else {
      currDate = date
    }
    const notWritableSemesters = await this.prisma.subject_semester.findMany({
      where: {
        OR: [
          {
            courseAddDropPeriodEnd: {
              gte: currDate
            },
          },
          {
            beginning: {
              gte: currDate
            }
          }
        ]
      }
    });
    const notWritableYearAndSemester = groupBy(notWritableSemesters.map((semester) => {
      return {
        semester: semester.semester,
        year: semester.year
      }
    }),(subject_semester) => subject_semester.year)

    const notWritableYearAndSemesterMap: Record<number, Record<number, {semester: number, year: number} >> = { } ;
    for (const key in notWritableYearAndSemester) {
      const objects = notWritableYearAndSemester[key];
      const mapObjects = groupBy(objects);
      notWritableYearAndSemesterMap[key] = mapObjects;
    }

    const takenLectures = await this.getTakenLectures(user);
    const reviewWritableLectures = takenLectures.filter((lecture) => {
      return notWritableYearAndSemesterMap[lecture.year]??[lecture.semester] ? true: false
    })

    // const lectures = await this.prisma.subject_lecture.findMany({
    //   where: {
    //     AND: notWritableYearAndSemester
    //   }
    // })

    return reviewWritableLectures;
  }

  getResearchLectureQuery(): Prisma.subject_lectureWhereInput {
    return {
      type_en: {
        in: ["Individual Study", "Thesis Study(Undergraduate)",
          "Thesis Research(MA/phD)"]
      }
    }
  }

  async getTakenLectures(user: session_userprofile): Promise<subject_lecture[]> {
    const lectures = (await this.prisma.session_userprofile_taken_lectures.findMany({
      where: {
        userprofile_id: user.id
      },
      include: {
        lecture: true
      }
    })).map((takenLecture) => takenLecture.lecture as subject_lecture);

    return lectures;
  }

  public semesterFilter(years: number[], semesters: number[]): object {
    if ((!years) && (!semesters)) {
      return null;
    } else if (!years) {
      return {
        semester: {
          In: semesters
        }
      }
    } else if (!semesters) {
      return {
        years: {
          In: semesters
        }
      }
    } else {
      return {
        AND: [
          {
            year: {
              In: years
            }
          },
          {
            semester: {
              In: semesters
            }
          }
        ]
      }
    }
  }

  public timeFilter(day: number[], begin: number[], end: number[]): object {
    const datetimeBegin = begin?.map((time) => this.datetimeConverter(time));
    const datetimeEnd = end?.map((time) => this.datetimeConverter(time));

    const dayFilter = day ? { day: {In: day} } : null;
    const beginFilter = begin ? { begin: {In: datetimeBegin} } : null;
    const endFilter = end ? { end: {In: datetimeEnd} } : null;
    return {
      AND: [
        dayFilter,
        beginFilter,
        endFilter
      ]
    }
  }

  public datetimeConverter (time: number) {
    const hour = Math.floor(time / 2) + 8;
    const minute = (time % 2) * 30;
    return new Date(0, 0, 0, hour, minute, 0, 0);
  }
}