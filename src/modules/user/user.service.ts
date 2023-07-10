import { UserRepository } from "../../prisma/repositories/user.repository";
import { Injectable, NotFoundException } from "@nestjs/common";
import { LectureRepository } from "../../prisma/repositories/lecture.repository";
import { session_userprofile, subject_department } from "@prisma/client";
import { DepartmentRepository } from "../../prisma/repositories/department.repository";
import { normalizeArray } from "../../common/utils/method.utils";
import { ResearchLecture } from "../../common/interfaces/constants/lecture";
import { ReviewRepository } from "../../prisma/repositories/review.repository";

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
    console.time('querying')
    const startTime = new Date();
    const departmentPromise = this.departmentRepository.getDepartmentOfUser(user).then((department) => {
      const endTime = new Date();
      console.log('querying department took: ', endTime.getTime() - startTime.getTime());
      return department;
    })
    const favoriteDepartmentsPromise = this.departmentRepository.getFavoriteDepartments(user).then((department) => {
      const endTime = new Date();
      console.log('querying favorite department took: ', endTime.getTime() - startTime.getTime());
      return department;
    })
    const majorsPromise = this.departmentRepository.getMajors(user).then((department) => {
      const endTime = new Date();
      console.log('querying majors took: ', endTime.getTime() - startTime.getTime());
      return department;
    })
    const minorsPromise = this.departmentRepository.getMinors(user).then((department) => {
      const endTime = new Date();
      console.log('querying minors took: ', endTime.getTime() - startTime.getTime());
      return department;
    })
    const specializedMajorsPromise = this.departmentRepository.getSpecializedMajors(user).then((department) => {
      const endTime = new Date();
      console.log('querying specializedMajors took: ', endTime.getTime() - startTime.getTime());
      return department;
    })
    const reviewWritableLecturesPromise = this.lectureRepository.findReviewWritableLectures(user, new Date()).then((department) => {
      const endTime = new Date();
      console.log('querying reviewWritableLectures took: ', endTime.getTime() - startTime.getTime());
      return department;
    })
    const takenLecturesPromise = this.lectureRepository.getTakenLectures(user).then((department) => {
      const endTime = new Date();
      console.log('querying takenLectures took: ', endTime.getTime() - startTime.getTime());
      return department;
    })
    const writtenReviewsPromise = this.reviewRepository.findReviewByUser(user).then((department) => {
      const endTime = new Date();
      console.log('querying writtenReview took: ', endTime.getTime() - startTime.getTime());
      return department;
    })
    promises.push(departmentPromise, favoriteDepartmentsPromise, majorsPromise, minorsPromise, specializedMajorsPromise,reviewWritableLecturesPromise,takenLecturesPromise,writtenReviewsPromise);
    const [department, favoriteDepartments, majors, minors, specializedMajors, reviewWritableLectures, takenLectures, writtenReviews] = await Promise.all(promises);
    console.timeEnd('querying')
    const departments =  Object.entries<subject_department>(normalizeArray([...majors, ...minors, ...specializedMajors, ...favoriteDepartments])) ?? [department];
    const researchLectures = Object.values(ResearchLecture);
    const timeTableLectures = takenLectures.filter((lecture) => researchLectures.includes(lecture.type_en));

    return {
      id: user.id,
      email: user.email,
      student_id : user.student_id,
      firstName: user.first_name,
      lastName: user.last_name,
      department: department ?? null,
      majors: majors,
      departments: departments,
      favorite_departments: favoriteDepartments,
      review_writeable_lectures: reviewWritableLectures,
      my_timetable_lectures: timeTableLectures,
      reviews: writtenReviews
    }
  }
}