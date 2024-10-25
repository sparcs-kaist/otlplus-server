import { Prisma } from '@prisma/client';
import { ETakenLecture } from './ETakenLecture';

export namespace EUserProfile {
  export const WithTakenLectures =
    Prisma.validator<Prisma.session_userprofileDefaultArgs>()({
      include: { taken_lectures: ETakenLecture.Basic },
    });

  export type WithTakenLectures = Prisma.session_userprofileGetPayload<
    typeof WithTakenLectures
  >;
}
