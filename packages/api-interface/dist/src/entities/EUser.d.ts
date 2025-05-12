import { Prisma } from '@prisma/client';
export declare namespace EUser {
  const Basic: {};
  type Basic = Prisma.session_userprofileGetPayload<typeof Basic>;
  const WithMajors: {
    include: {
      session_userprofile_majors: true;
    };
  };
  type WithMajors = Prisma.session_userprofileGetPayload<typeof WithMajors>;
  const WithMinors: {
    include: {
      session_userprofile_minors: true;
    };
  };
  type WithMinors = Prisma.session_userprofileGetPayload<typeof WithMinors>;
}
