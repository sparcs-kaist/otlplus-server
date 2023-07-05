import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { Prisma, session_userprofile, subject_lecture } from "@prisma/client";
import { lectureSelectResultType } from "../../common/schemaTypes/types";

@Injectable()
export class LectureRepository {
  constructor(private readonly prisma: PrismaService) {
  }


  async findReviewWritableLectures(date?: Date): Promise<subject_lecture[]> {
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

    const notWritableYearAndSemester = notWritableSemesters.map((semester) => {
      return {
        semester: semester.semester,
        year: semester.year
      }
    })

    const lectures = await this.prisma.subject_lecture.findMany({
      where: {
        AND: notWritableYearAndSemester
      }
    })

    return lectures;
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
    const lectures: subject_lecture[] = (await this.prisma.session_userprofile_taken_lectures.findMany({
      where: {
        userprofile_id: user.id
      },
      include: {
        lecture: true
      }
    })).map((takenLecture) => takenLecture.lecture);

    return lectures;
  }
}