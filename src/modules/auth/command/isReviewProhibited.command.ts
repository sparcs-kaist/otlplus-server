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

    if (isReviewProhibited) {
      try {
        if (!reviewsBody || !reviewsBody.lecture) {
          throw new Error('lecture info are not found from request');
        }
        const lecture = await this.lectureService.getLectureById(
          reviewsBody.lecture,
        );
        // TODO: implement logic to replace hardcoded values
        if (lecture.year == 2025 && lecture.semester == 1) {
          prevResult.authentication = false;
        }
        return Promise.resolve(prevResult);
      } catch (e) {
        console.log(e);
        return Promise.resolve(prevResult);
      }
    }

    return Promise.resolve(prevResult);
  }
}
