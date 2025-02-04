import { Prisma } from '@prisma/client';
import { ETakenLecture } from '@otl/api-interface/src/entities/ETakenLecture';

export namespace EUserProfile {
  export const WithTakenLectures =
    Prisma.validator<Prisma.session_userprofileDefaultArgs>()({
      include: { taken_lectures: ETakenLecture.Basic },
    });

  export type WithTakenLectures = Prisma.session_userprofileGetPayload<
    typeof WithTakenLectures
  >;
}
