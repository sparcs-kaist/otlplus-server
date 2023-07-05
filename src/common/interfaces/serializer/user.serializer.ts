import { Prisma, review_review, session_userprofile, subject_department } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
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

export async function toProfileDto(user: userSelectResultType, prisma: PrismaService) {


  const majors: subject_department[] = await prisma.session_userprofile.findMany({
    include: {
      session_userprofile_majors: {
        include: {
          subject_department: true
        }
      },
      favorite_departments: {
        include:{
          department: true
        }
      }
    }
  });

  const reviewList: review_review[] = await prisma.review_review.findMany({

  })


  return {
    id: user.id,
    email: user.email,
    student_id: user.student_id,
    firstName: user.first_name,
    lastName: user.last_name,
    department: user.department,
    majors: user.session_userprofile_majors.
  };
}