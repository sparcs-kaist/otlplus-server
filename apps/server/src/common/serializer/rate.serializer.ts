import { support_rate } from '@prisma/client';
import { IRate } from '@otl/server-nest/common/interfaces';

export function toJsonRate(rate: support_rate): IRate.Basic {
  return {
    id: rate.id,
    score: rate.score,
    user_id: rate.user_id,
    version: rate.version,
    created_datetime: rate.created_datetime,
  };
}
