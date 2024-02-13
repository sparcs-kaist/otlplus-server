import { EFeed } from 'src/common/entites/EFeed';
import { IFeed } from '../IFeed';
import { FeedType } from '../constants/feed';
import { toJsonCourseRelated } from './course.serializer';
import { toJsonDepartment } from './department.serializer';
import { toJsonLecture } from './lecture.serializer';
import { toJsonReview } from './review.serializer';

export const toJsonFeedDetails = (feed: EFeed.EDetails): IFeed.Details => {
  if (EFeed.isFamousHumanityReview(feed)) {
    return {
      type: FeedType.FamousHumanityReview,
      date: feed.date,
      priority: feed.priority,
      reviews: feed.main_famoushumanityreviewdailyfeed_reviews.map(
        (feedReview) => toJsonReview(feedReview.review_review),
      ),
    };
  } else if (EFeed.isFamousMajorReview(feed)) {
    return {
      type: FeedType.FamousMajorReview,
      date: feed.date,
      priority: feed.priority,
      reviews: feed.main_famousmajorreviewdailyfeed_reviews.map((feedReview) =>
        toJsonReview(feedReview.review_review),
      ),
      department: toJsonDepartment(feed.subject_department),
    };
  } else if (EFeed.isReviewWrite(feed)) {
    return {
      type: FeedType.ReviewWrite,
      date: feed.date,
      priority: feed.priority,
      lecture: toJsonLecture(feed.subject_lecture, true),
    };
  } else if (EFeed.isRelatedCourse(feed)) {
    return {
      type: FeedType.RelatedCourse,
      date: feed.date,
      priority: feed.priority,
      course: toJsonCourseRelated(feed.subject_course),
    };
  } else if (EFeed.isRankedReview(feed)) {
    return {
      type: FeedType.RankedReview,
      date: feed.date,
      priority: feed.priority,
      reviews: feed.reviews.map((review) => toJsonReview(review)),
    };
  }
  return { type: FeedType.Rate, date: feed.date, priority: feed.priority };
};
