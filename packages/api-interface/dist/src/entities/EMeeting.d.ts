import { Prisma } from '@prisma/client';
export declare namespace EMeeting {
  const Group: {
    include: {
      days: true;
      members: true;
    };
  };
  type Group = Prisma.meeting_groupGetPayload<typeof Group>;
}
