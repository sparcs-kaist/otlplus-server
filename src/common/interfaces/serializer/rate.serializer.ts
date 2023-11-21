import { support_rate } from '@prisma/client';
import { IRate } from '../structures';

export function toJsonRate(rate: support_rate): IRate {
  return {
    id: rate.id,
    score: rate.score,
    user_id: rate.user_id,
    version: rate.version,
    created_datetime: rate.created_datetime,
  };
}
