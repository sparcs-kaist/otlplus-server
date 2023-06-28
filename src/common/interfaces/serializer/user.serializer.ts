import { Prisma, session_userprofile } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { type } from "os";
import { Union } from "../../utils/method.utils";
import { userSelectResultType } from "../../schemaTypes/types";

export async function loadUser(user:session_userprofile | userSelectResultType,  userLoadOptions: Prisma.session_userprofileInclude, prismaService: PrismaService): Promise<userSelectResultType> {

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

  const result: userSelectResultType = await prismaService.session_userprofile.findFirst({
    where: { sid: user.sid },
    include: userLoadOptions,
  })
  return result;
}

export function toProfileDto(user: session_userprofile) {

}