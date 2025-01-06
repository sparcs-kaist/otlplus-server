import { SetMetadata } from '@nestjs/common';

export const IS_REVIEW_PROHIBITED_KEY = 'isReviewProhibited';
export const ReviewProhibited = () =>
  SetMetadata(IS_REVIEW_PROHIBITED_KEY, true);
