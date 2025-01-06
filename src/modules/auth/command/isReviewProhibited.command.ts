import { ExecutionContext, Injectable } from '@nestjs/common';
import { IS_REVIEW_PROHIBITED_KEY } from '../../../common/decorators/prohibit-review.decorator';
import { Reflector } from '@nestjs/core';
import { AuthCommand, AuthResult } from '../auth.command';
import { LecturesService } from '@src/modules/lectures/lectures.service';
import { Request } from 'express';

@Injectable()
export class IsReviewProhibitedCommand implements AuthCommand {
  constructor(
    private reflector: Reflector,
    private lectureService: LecturesService,
  ) {}

  public async next(
    context: ExecutionContext,
    prevResult: AuthResult,
  ): Promise<AuthResult> {
    const isReviewProhibited = this.reflector.getAllAndOverride<boolean>(
      IS_REVIEW_PROHIBITED_KEY,
      [context.getHandler()],
    );

    const request = context.switchToHttp().getRequest<Request>();
    const reviewsBody = request.body;

    console.log('isReviewProhibited: ', isReviewProhibited);

    console.log(reviewsBody);

    if (isReviewProhibited) {
      try {
        if (!reviewsBody || !reviewsBody.lecture) {
          throw new Error('lecture info are not found from request');
        }
        const lecture = await this.lectureService.getLectureById(
          reviewsBody.lecture,
        );
        console.log(
          'lecture year',
          lecture.year,
          'lecture semester',
          lecture.semester,
        );
        if (lecture.year == 2025 && lecture.semester == 1) {
          prevResult.isReviewProhibited = true;
        }
        return Promise.resolve(prevResult);
      } catch (e: any) {
        console.log(e);
        return Promise.resolve(prevResult);
      }
    }

    return Promise.resolve(prevResult);
  }
}
