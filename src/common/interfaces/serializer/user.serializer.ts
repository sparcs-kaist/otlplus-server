import { Prisma, session_userprofile } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";

export async function loadUser(user: session_userprofile, userLoadOptions: Prisma.session_userprofileInclude, prismaService: PrismaService) {
  const loadOptions = Object.entries(userLoadOptions).forEach(([key, value]) => {
    if(user[key] && value) {
      value = false;
    }else if(user[key] && !value) {
      value = false
    }
    else if(!user[key] && value) {
      value = true
    }else if(!user[key] && !value) {
      value = false
    }
  })
  const result =  await prismaService.session_userprofile.findFirst({
    where: { sid: user.sid },
    include: userLoadOptions,
  })
  return result;
}

export function toProfileDto(user: session_userprofile) {

}