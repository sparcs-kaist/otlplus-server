import { session_userprofile } from '@prisma/client';
import { EFeed } from '@otl/api-interface/src/entities/EFeed';
import { IFeed } from '@otl/api-interface/src/interfaces/IFeed';
import { toJsonFeedRelated } from './course.serializer';
import { toJsonDepartment } from './department.serializer';
import { toJsonLectureBasic } from './lecture.serializer';
import { toJsonReview } from './review.serializer';
import { FeedType } from '@otl/api-interface/src/interfaces/constants/feed';

export const toJsonFeedDetails = (feed: EFeed.Details, user: session_userprofile): IFeed.Details => {
  if (EFeed.isFamousHumanityReview(feed)) {
    return {
      type: FeedType.FamousHumanityReview,
      date: feed.date,
      priority: feed.priority,
      reviews: feed.main_famoushumanityreviewdailyfeed_reviews.map((feedReview) =>
        toJsonReview(feedReview.review_review, user),
      ),
    };
  } else if (EFeed.isFamousMajorReview(feed)) {
    return {
      type: FeedType.FamousMajorReview,
      date: feed.date,
      priority: feed.priority,
      reviews: feed.main_famousmajorreviewdailyfeed_reviews.map((feedReview) =>
        toJsonReview(feedReview.review_review, user),
      ),
      department: toJsonDepartment(feed.subject_department),
    };
  } else if (EFeed.isReviewWrite(feed)) {
    return {
      type: FeedType.ReviewWrite,
      date: feed.date,
      priority: feed.priority,
      lecture: toJsonLectureBasic(feed.subject_lecture),
    };
  } else if (EFeed.isRelatedCourse(feed)) {
    return {
      type: FeedType.RelatedCourse,
      date: feed.date,
      priority: feed.priority,
      course: toJsonFeedRelated(feed.subject_course),
    };
  } else if (EFeed.isRankedReview(feed)) {
    return {
      type: FeedType.RankedReview,
      date: feed.date,
      priority: feed.priority,
      reviews: feed.reviews.map((review) => toJsonReview(review, user)),
    };
  }
  return { type: FeedType.Rate, date: feed.date, priority: feed.priority };
};
