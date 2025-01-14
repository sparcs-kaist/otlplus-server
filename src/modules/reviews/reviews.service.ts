import { Transactional } from '@nestjs-cls/transactional';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { review_review, session_userprofile } from '@prisma/client';
import { IReview } from 'src/common/interfaces/IReview';
import { toJsonReview } from 'src/common/interfaces/serializer/review.serializer';
import { LectureRepository } from 'src/prisma/repositories/lecture.repository';
import { ReviewsRepository } from 'src/prisma/repositories/review.repository';
import { EReview } from '../../common/entities/EReview';
import EReviewVote = EReview.EReviewVote;

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    private readonly lectureRepository: LectureRepository,
  ) {}

  async getReviewById(
    reviewId: number,
    user: session_userprofile,
  ): Promise<IReview.Basic & { userspecific_is_liked: boolean }> {
    const review = await this.reviewsRepository.getReviewById(reviewId);
    if (review == undefined) throw new HttpException("Can't find review", 404);
    const result = toJsonReview(review);
    if (user) {
      const isLiked: boolean = await this.reviewsRepository.isLiked(
        review.id,
        user.id,
      );
      return Object.assign(result, {
        userspecific_is_liked: isLiked,
      });
    } else {
      return Object.assign(result, {
        userspecific_is_liked: false,
      });
    }
  }
  async getReviews(
    reviewsParam: IReview.QueryDto,
    user: session_userprofile,
  ): Promise<(IReview.Basic & { userspecific_is_liked: boolean })[]> {
    const MAX_LIMIT = 50;
    const DEFAULT_ORDER = ['-written_datetime', '-id'];
    const reviews = await this.reviewsRepository.getReviews(
      reviewsParam.order ?? DEFAULT_ORDER,
      reviewsParam.offset ?? 0,
      reviewsParam.limit ?? MAX_LIMIT,
      reviewsParam.lecture_year,
      reviewsParam.lecture_semester,
    );
    return await Promise.all(
      reviews.map(async (review) => {
        const result = toJsonReview(review);
        if (user) {
          const isLiked: boolean = await this.reviewsRepository.isLiked(
            review.id,
            user.id,
          );
          return Object.assign(result, {
            userspecific_is_liked: isLiked,
          });
        } else {
          return Object.assign(result, {
            userspecific_is_liked: false,
          });
        }
      }),
    );
  }

  async getReviewsCount(
    lectureYear?: number,
    lectureSemester?: number,
  ): Promise<number> {
    return await this.reviewsRepository.getReviewsCount(
      lectureYear,
      lectureSemester,
    );
  }

  @Transactional()
  async createReviews(
    reviewsBody: IReview.CreateDto,
    user: session_userprofile,
  ): Promise<IReview.Basic & { userspecific_is_liked: boolean }> {
    const reviewWritableLectures =
      await this.lectureRepository.findReviewWritableLectures(user, new Date());
    const reviewLecture = reviewWritableLectures.find((lecture) => {
      return lecture.id == reviewsBody.lecture;
    });
    if (reviewLecture == undefined)
      throw new HttpException("Can't find lecture", 404);
    const review = await this.reviewsRepository.upsertReview(
      reviewLecture.course_id,
      reviewLecture.id,
      reviewsBody.content,
      reviewsBody.grade,
      reviewsBody.load,
      reviewsBody.speech,
      user.id,
    );
    const result = toJsonReview(review);
    if (user) {
      const isLiked: boolean = await this.reviewsRepository.isLiked(
        review.id,
        user.id,
      );
      return Object.assign(result, {
        userspecific_is_liked: isLiked,
      });
    } else {
      return Object.assign(result, {
        userspecific_is_liked: false,
      });
    }
  }

  @Transactional()
  async updateReviewById(
    reviewId: number,
    user: session_userprofile,
    reviewBody: IReview.UpdateDto,
  ): Promise<IReview.Basic & { userspecific_is_liked: boolean }> {
    const review = await this.reviewsRepository.getReviewById(reviewId);
    if (!review) throw new HttpException("Can't find review", 404);
    if (review.writer_id !== user.id)
      throw new HttpException("Can't find user", 401);
    if (review.is_deleted)
      throw new HttpException(
        'Target review deleted by admin',
        HttpStatus.BAD_REQUEST,
      );
    const updateReview = await this.reviewsRepository.updateReview(
      review.id,
      reviewBody.content,
      reviewBody.grade,
      reviewBody.load,
      reviewBody.speech,
    );
    const result = toJsonReview(updateReview);
    if (user) {
      const isLiked: boolean = await this.reviewsRepository.isLiked(
        review.id,
        user.id,
      );
      return Object.assign(result, {
        userspecific_is_liked: isLiked,
      });
    } else {
      return Object.assign(result, {
        userspecific_is_liked: false,
      });
    }
  }

  async findReviewVote(
    reviewId: number,
    user: session_userprofile,
  ): Promise<boolean> {
    const review = await this.reviewsRepository.getReviewById(reviewId);
    if (review == undefined) throw new HttpException("Can't find review", 404);
    const isLiked: boolean = await this.reviewsRepository.isLiked(
      review.id,
      user.id,
    );
    return isLiked;
  }

  @Transactional()
  async createReviewVote(
    reviewId: number,
    user: session_userprofile,
  ): Promise<EReviewVote.Basic> {
    return await this.reviewsRepository.upsertReviewVote(reviewId, user.id);
  }

  @Cron('0 0 * * *') // 매일 자정에 실행하는 Cron 작업 설정: 과거 update-best-reviews.py를 계승
  async updateBestReviewsCron() {
    function calculateKey(review: any): number {
      const baseYear = new Date().getFullYear();
      const lectureYear = review.lecture.year;
      const yearDiff = baseYear - lectureYear > 0 ? baseYear - lectureYear : 0;
      return Math.floor(
        (review.like / (review.lecture.audience + 1)) *
          Math.pow(0.85, yearDiff),
      );
    }

    function getBestReviews(
      reviews: review_review[],
      minLikedCount: number,
      maxResultCount: number,
    ): review_review[] {
      const likedCount = Math.max(
        minLikedCount,
        Math.floor(reviews.length / 10),
      );

      const mostLikedReviews = reviews
        .sort((a, b) => calculateKey(b) - calculateKey(a))
        .slice(0, likedCount);

      const latestDateStart = new Date();
      latestDateStart.setDate(latestDateStart.getDate() - 7);

      const latestReviews = reviews.filter(
        (review) =>
          review.written_datetime &&
          new Date(review.written_datetime) >= latestDateStart,
      );

      const bestCandidateReviews = [...mostLikedReviews, ...latestReviews];
      return bestCandidateReviews.length > maxResultCount
        ? bestCandidateReviews.slice(0, maxResultCount)
        : bestCandidateReviews;
    }

    console.log('Running scheduled job: Update Best Reviews');

    // Process humanity reviews
    const humanityReviews = await this.reviewsRepository.getHumanityReviews();
    const humanityBestReviews = getBestReviews(humanityReviews, 50, 20);

    await this.reviewsRepository.clearHumanityBestReviews();
    await this.reviewsRepository.addHumanityBestReviews(
      humanityBestReviews.map((r) => ({ reviewId: r.id })),
    );

    // Process major reviews
    const majorReviews = await this.reviewsRepository.getMajorReviews();
    const majorBestReviews = getBestReviews(majorReviews, 2000, 1000);

    await this.reviewsRepository.clearMajorBestReviews();
    await this.reviewsRepository.addMajorBestReviews(
      majorBestReviews.map((r) => ({ reviewId: r.id })),
    );

    console.log('BestReview updated by scheduled job');
  }
}
