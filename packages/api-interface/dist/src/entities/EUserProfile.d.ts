import { Prisma } from '@prisma/client';
export declare namespace EUserProfile {
  const WithTakenLectures: {
    include: {
      taken_lectures: {};
    };
  };
  type WithTakenLectures = Prisma.session_userprofileGetPayload<typeof WithTakenLectures>;
}
