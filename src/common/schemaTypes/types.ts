import { Prisma } from "@prisma/client";

export type userSelectResultType = Prisma.session_userprofileGetPayload<{
  include: Prisma.session_userprofileInclude
}>

export type courseSelectResultType = Prisma.subject_courseGetPayload<{
  include: Prisma.subject_courseInclude
}>

export type lectureSelectResultType = Prisma.subject_lectureGetPayload<{
  include: Prisma.subject_lectureInclude
}>

export type departmentSelectResultType = Prisma.subject_departmentGetPayload<{
  include: Prisma.subject_departmentInclude
}>