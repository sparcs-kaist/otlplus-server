import {
  FamousHumanityReviewDailyFeed_details,
  FamousMajorReviewDailyFeed_Details,
  RankedReviewDailyFeed_details,
  RelatedCourseDailyUserFeed_details,
  ReviewWriteDailyUserFeed_details,
  isFamousHumanityReviewDailyFeed,
  isFamousMajorReviewDailyFeed,
  isReviewWriteDailyUserFeed,
} from 'src/common/schemaTypes/feeds';
import { IFeed } from '../dto/feeds/IFeed';
import { toJsonCourseBasic } from './course.serializer';
import { toJsonDepartment } from './department.serializer';
import { toJsonLecture } from './lecture.serializer';
import { toJsonReview } from './review.serializer';

export const toJsonFeed = (
  feed:
    | FamousHumanityReviewDailyFeed_details
    | RankedReviewDailyFeed_details
    | FamousMajorReviewDailyFeed_Details
    | ReviewWriteDailyUserFeed_details
    | RelatedCourseDailyUserFeed_details,
): IFeed.IBasic => {
  if (isFamousHumanityReviewDailyFeed(feed)) {
    return {
      type: 'FAMOUS_HUMANITY_REVIEW',
      date: feed.date,
      priority: feed.priority,
      reviews: feed.main_famoushumanityreviewdailyfeed_reviews.map(
        (feedReview) => toJsonReview(feedReview.review_review),
      ),
    };
  } else if (isFamousMajorReviewDailyFeed(feed)) {
    return {
      type: 'FAMOUS_MAJOR_REVIEW',
      date: feed.date,
      priority: feed.priority,
      reviews: feed.main_famousmajorreviewdailyfeed_reviews.map((feedReview) =>
        toJsonReview(feedReview.review_review),
      ),
      department: toJsonDepartment(feed.subject_department),
    };
  } else if (isReviewWriteDailyUserFeed(feed)) {
    return {
      type: 'REVIEW_WRITE',
      date: feed.date,
      priority: feed.priority,
      lecture: toJsonLecture(feed.subject_lecture, true),
    };
  } else if ('subject_course' in feed) {
    return {
      type: 'RELATED_COURSE',
      date: feed.date,
      priority: feed.priority,
      course: toJsonCourseBasic(feed.subject_course),
    };
  }

  return {
    type: 'RANKED_REVIEW',
    date: feed.date,
    priority: feed.priority,
    reviews: feed.reviews.map((review) => toJsonReview(review)),
  };
};
