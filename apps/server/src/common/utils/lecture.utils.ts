import { applyOrder } from '@otl/common/utils/util';
import { subject_lecture } from '@prisma/client';

export const getRepresentativeLecture = (lectures: subject_lecture[]): subject_lecture => {
  const orderedLectures = applyOrder<subject_lecture>(lectures, ['year', 'semester']);
  return orderedLectures[0];
};
