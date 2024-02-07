import { FeedSchema } from 'src/common/schemaTypes/feeds';
import { FeedType } from '../constants/feed';
import { IFeed } from '../structures/IFeed';
import { toJsonCourseBasic } from './course.serializer';
import { toJsonDepartment } from './department.serializer';
import { toJsonLecture } from './lecture.serializer';
import { toJsonReview } from './review.serializer';

export const toJsonFeed = (feed: FeedSchema.Details): IFeed.IDetials => {
  if (FeedSchema.isFamousHumanityReview(feed)) {
    return {
      type: FeedType.FamousHumanityReview,
      date: feed.date,
      priority: feed.priority,
      reviews: feed.main_famoushumanityreviewdailyfeed_reviews.map(
        (feedReview) => toJsonReview(feedReview.review_review),
      ),
    };
  } else if (FeedSchema.isFamousMajorReview(feed)) {
    return {
      type: FeedType.FamousMajorReview,
      date: feed.date,
      priority: feed.priority,
      reviews: feed.main_famousmajorreviewdailyfeed_reviews.map((feedReview) =>
        toJsonReview(feedReview.review_review),
      ),
      department: toJsonDepartment(feed.subject_department),
    };
  } else if (FeedSchema.isReviewWrite(feed)) {
    return {
      type: FeedType.ReviewWrite,
      date: feed.date,
      priority: feed.priority,
      lecture: toJsonLecture(feed.subject_lecture, true),
    };
  } else if (FeedSchema.isRelatedCourse(feed)) {
    return {
      type: FeedType.RelatedCourse,
      date: feed.date,
      priority: feed.priority,
      course: toJsonCourseBasic(feed.subject_course),
    };
  } else if (FeedSchema.isRankedReview(feed)) {
    return {
      type: FeedType.RankedReview,
      date: feed.date,
      priority: feed.priority,
      reviews: feed.reviews.map((review) => toJsonReview(review)),
    };
  }
  return { type: FeedType.Rate, date: feed.date, priority: feed.priority };
};
