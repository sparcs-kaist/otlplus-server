import { Prisma } from "@prisma/client";

export type userSelectResultType = Prisma.session_userprofileGetPayload<{
  include: Prisma.session_userprofileInclude
}>

export type courseSelectResultType = Prisma.subject_courseGetPayload<{
  include: Prisma.subject_courseInclude
}>
