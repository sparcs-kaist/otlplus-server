import { Prisma } from '@prisma/client';

export namespace EUser {
  export const Basic =
    Prisma.validator<Prisma.session_userprofileDefaultArgs>()({});
  export type Basic = Omit<Prisma.session_userprofileGetPayload<typeof Basic>, 'name_kor' | 'name_eng'> & {
    name_kor: string;
    name_eng: string;
  };

  export const WithMajors =
    Prisma.validator<Prisma.session_userprofileDefaultArgs>()({
      include: {
        session_userprofile_majors: true,
      },
    });
  export type WithMajors = Prisma.session_userprofileGetPayload<typeof WithMajors>;

  export const WithMinors =
    Prisma.validator<Prisma.session_userprofileDefaultArgs>()({
      include: {
        session_userprofile_minors: true,
      },
    });
  export type WithMinors = Prisma.session_userprofileGetPayload<typeof WithMinors>;
}
