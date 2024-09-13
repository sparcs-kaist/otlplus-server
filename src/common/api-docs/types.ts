/* eslint-disable @typescript-eslint/ban-types */
import {
  IAuth,
  IUser,
  ICourse,
  ILecture,
  IReview,
  IFeed,
  INotice,
  IPlanner,
  IRate,
  ISemester,
  ISession,
  IDepartment,
  IShare,
  ITimetable,
  IWishlist,
} from 'src/common/interfaces';
export namespace getHello {
  export type requestParam = never;
  export type requestBody = never;
  export type responseBody = never;
}

export namespace user_login {
  export type requestParam = never;
  export type requestBody = never;
  export type responseBody = never;
}

export namespace loginCallback {
  export type requestParam = never;
  export type requestBody = never;
  export type responseBody = void;
}

export namespace getUserProfile {
  export type requestParam = never;
  export type requestBody = never;
  export type responseBody = IUser.Profile;
}

export namespace home {
  export type requestParam = never;
  export type requestBody = never;
  export type responseBody = void;
}

export namespace logout {
  export type requestParam = never;
  export type requestBody = never;
  export type responseBody = void;
}

export namespace getCourses {
  export type requestParam = never;
  export type requestBody = never;
  export type responseBody = ICourse.DetailWithIsRead[];
}

export namespace getCourseAutocomplete {
  export type requestParam = never;
  export type requestBody = never;
  export type responseBody = string | undefined;
}

export namespace getCourseById {
  export type requestParam = number;
  export type requestBody = never;
  export type responseBody = ICourse.DetailWithIsRead;
}

export namespace getLecturesByCourseId {
  export type requestParam = number;
  export type requestBody = never;
  export type responseBody = ILecture.Detail[];
}

export namespace getReviewByCourseId {
  export type requestParam = number;
  export type requestBody = never;
  export type responseBody = IReview.Basic[];
}

export namespace readCourse {
  export type requestParam = number;
  export type requestBody = never;
  export type responseBody = {
    id: number;
    latest_read_datetime: Date;
    course_id: number;
    user_profile_id: number;
  } & {};
}

export namespace getUserFeeds {
  export type requestParam = never;
  export type requestBody = never;
  export type responseBody = IFeed.Details[];
}

export namespace getLectures {
  export type requestParam = never;
  export type requestBody = never;
  export type responseBody = ILecture.Detail[];
}

export namespace getLectureAutocomplete {
  export type requestParam = never;
  export type requestBody = never;
  export type responseBody = string | undefined;
}

export namespace getLectureById {
  export type requestParam = number;
  export type requestBody = never;
  export type responseBody = ILecture.Detail;
}

export namespace getLectureReviews {
  export type requestParam = number;
  export type requestBody = never;
  export type responseBody = (IReview.Basic & {
    userspecific_is_liked: boolean;
  })[];
}

export namespace getLectureRelatedReviews {
  export type requestParam = number;
  export type requestBody = never;
  export type responseBody = (IReview.Basic & {
    userspecific_is_liked: boolean;
  })[];
}

export namespace getNotices {
  export type requestParam = never;
  export type requestBody = never;
  export type responseBody = INotice.Basic[];
}

export namespace getPlanners {
  export type requestParam = number;
  export type requestBody = never;
  export type responseBody = IPlanner.Detail[];
}

export namespace postPlanner {
  export type requestParam = number;
  export type requestBody = IPlanner.CreateBodyDto;
  export type responseBody = IPlanner.Detail;
}

export namespace addArbitraryItem {
  export type requestParam = number;
  export type requestBody = IPlanner.AddArbitraryItemDto;
  export type responseBody = IPlanner.IItem.Arbitrary;
}

export namespace removePlanner {
  export type requestParam = number;
  export type requestBody = IPlanner.RemoveItemBodyDto;
  export type responseBody = IPlanner.Detail;
}

export namespace addFutureItem {
  export type requestParam = number;
  export type requestBody = IPlanner.FuturePlannerItemDto;
  export type responseBody = IPlanner.IItem.Future;
}

export namespace reorderPlanner {
  export type requestParam = number;
  export type requestBody = IPlanner.ReorderBodyDto;
  export type responseBody = IPlanner.Detail;
}

export namespace updatePlanner {
  export type requestParam = number;
  export type requestBody = IPlanner.UpdateItemBodyDto;
  export type responseBody =
    | IPlanner.IItem.Taken
    | IPlanner.IItem.Future
    | IPlanner.IItem.Arbitrary;
}

export namespace createRates {
  export type requestParam = never;
  export type requestBody = IRate.CreateDto;
  export type responseBody = IRate.Basic;
}

export namespace getReviews {
  export type requestParam = never;
  export type requestBody = never;
  export type responseBody =
    | number
    | (IReview.Basic & { userspecific_is_liked: boolean })[];
}

export namespace createReviews {
  export type requestParam = never;
  export type requestBody = IReview.CreateDto;
  export type responseBody = IReview.Basic & { userspecific_is_liked: boolean };
}

export namespace getReviewInstance {
  export type requestParam = number;
  export type requestBody = never;
  export type responseBody = IReview.Basic & { userspecific_is_liked: boolean };
}

export namespace updateReviewInstance {
  export type requestParam = number;
  export type requestBody = IReview.UpdateDto;
  export type responseBody = IReview.Basic & { userspecific_is_liked: boolean };
}

export namespace likeReviewInstance {
  export type requestParam = number;
  export type requestBody = never;
  export type responseBody = {
    id: number;
    review_id: number;
    userprofile_id: number | null;
    created_datetime: Date | null;
  } & {};
}

export namespace getSemesters {
  export type requestParam = never;
  export type requestBody = never;
  export type responseBody = ISemester.Response[];
}

export namespace departmentOptions {
  export type requestParam = never;
  export type requestBody = never;
  export type responseBody = IDepartment.Basic[][];
}

export namespace favoriteDepartments {
  export type requestParam = never;
  export type requestBody = ISession.FavoriteDepartmentsDto;
  export type responseBody = {
    id: number;
    student_id: string;
    sid: string;
    department_id: number | null;
    email: string | null;
    date_joined: Date;
    first_name: string;
    last_name: string;
    refresh_token: string | null;
  } & {};
}

export namespace getTimetableImage {
  export type requestParam = never;
  export type requestBody = never;
  export type responseBody = void;
}

export namespace getTimetableIcal {
  export type requestParam = never;
  export type requestBody = never;
  export type responseBody = void;
}

export namespace getStatus {
  export type requestParam = never;
  export type requestBody = never;
  export type responseBody = never;
}

export namespace getTimetables {
  export type requestParam = number;
  export type requestBody = never;
  export type responseBody = ITimetable.Response[];
}

export namespace getTimeTable {
  export type requestParam = number;
  export type requestBody = never;
  export type responseBody = ITimetable.Response;
}

export namespace deleteTimetable {
  export type requestParam = number;
  export type requestBody = never;
  export type responseBody = ({
    id: number;
    year: number | null;
    semester: number | null;
    user_id: number;
    arrange_order: number;
  } & {})[];
}

export namespace createTimetable {
  export type requestParam = never;
  export type requestBody = ITimetable.CreateDto;
  export type responseBody = ITimetable.Response;
}

export namespace addLectureToTimetable {
  export type requestParam = number;
  export type requestBody = ITimetable.AddLectureDto;
  export type responseBody = ITimetable.Response;
}

export namespace removeLectureFromTimetable {
  export type requestParam = number;
  export type requestBody = ITimetable.AddLectureDto;
  export type responseBody = ITimetable.Response;
}

export namespace reorderTimetable {
  export type requestParam = number;
  export type requestBody = ITimetable.ReorderTimetableDto;
  export type responseBody = ITimetable.Response;
}

export namespace getTracks {
  export type requestParam = never;
  export type requestBody = never;
  export type responseBody = {
    general: IPlanner.ITrack.General[];
    major: IPlanner.ITrack.Major[];
    additional: IPlanner.ITrack.Additional[];
  };
}

export namespace getUserTakenCourses {
  export type requestParam = number;
  export type requestBody = never;
  export type responseBody = ICourse.DetailWithIsRead[];
}

export namespace getUserLikedReviews {
  export type requestParam = number;
  export type requestBody = never;
  export type responseBody = (IReview.Basic & {
    userspecific_is_liked: boolean;
  })[];
}

export namespace getLectures {
  export type requestParam = number;
  export type requestBody = never;
  export type responseBody = IWishlist.WithLectures;
}

export namespace addLecture {
  export type requestParam = number;
  export type requestBody = IWishlist.AddLectureDto;
  export type responseBody = IWishlist.WithLectures;
}

export namespace removeLecture {
  export type requestParam = number;
  export type requestBody = IWishlist.RemoveLectureDto;
  export type responseBody = IWishlist.WithLectures;
}
