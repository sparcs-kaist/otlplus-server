import { UserRepository } from "../../prisma/repositories/user.repository";
import { Injectable, NotFoundException } from "@nestjs/common";
import { LectureRepository } from "../../prisma/repositories/lecture.repository";
import { session_userprofile, subject_department } from "@prisma/client";
import { DepartmentRepository } from "../../prisma/repositories/department.repository";
import { normalizeArray } from "../../common/utils/method.utils";
import { ResearchLecture } from "../../common/interfaces/constants/lecture";
import { ReviewRepository } from "../../prisma/repositories/review.repository";
import { toJsonDepartment } from "../../common/interfaces/serializer/department.serializer";

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly lectureRepository: LectureRepository,
    private readonly departmentRepository: DepartmentRepository,
    private readonly reviewRepository: ReviewRepository,
  ) {
  }

  public async findBySid(sid: string){
    const user =  this.userRepository.findBySid(sid);
    if (!user) {
      throw new NotFoundException(`Can't find user with sid: ${sid}`);
    }
  }

  public async getProfile(user: session_userprofile){
    const promises = [];
    const departmentPromise = this.departmentRepository.getDepartmentOfUser(user)
    const favoriteDepartmentsPromise = this.departmentRepository.getFavoriteDepartments(user)
    const majorsPromise = this.departmentRepository.getMajors(user)
    const minorsPromise = this.departmentRepository.getMinors(user)
    const specializedMajorsPromise = this.departmentRepository.getSpecializedMajors(user)
    const reviewWritableLecturesPromise = this.lectureRepository.findReviewWritableLectures(user, new Date())
    const takenLecturesPromise = this.lectureRepository.getTakenLectures(user)
    const writtenReviewsPromise = this.reviewRepository.findReviewByUser(user)
    promises.push(departmentPromise, favoriteDepartmentsPromise, majorsPromise, minorsPromise, specializedMajorsPromise,reviewWritableLecturesPromise,takenLecturesPromise,writtenReviewsPromise);
    const [department, favoriteDepartments, majors, minors, specializedMajors, reviewWritableLectures, takenLectures, writtenReviews] = await Promise.all(promises);
    const departments =  Object.values<subject_department>(normalizeArray<subject_department>([...majors, ...minors, ...specializedMajors, ...favoriteDepartments])) ?? [department];
    const researchLectures = Object.values(ResearchLecture);
    const timeTableLectures = takenLectures.filter((lecture) => researchLectures.includes(lecture.type_en));

    return {
      id: user.id,
      email: user.email,
      student_id : user.student_id,
      firstName: user.first_name,
      lastName: user.last_name,
      department: toJsonDepartment(department) ?? null,
      majors: toJsonDepartment(majors),
      departments: departments.map((department) => toJsonDepartment(department)),
      favorite_departments: favoriteDepartments.map((department) => toJsonDepartment(department)),
      review_writeable_lectures: reviewWritableLectures,
      my_timetable_lectures: timeTableLectures,
      reviews: writtenReviews
    }
  }
}