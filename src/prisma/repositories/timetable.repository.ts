import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { Prisma, session_userprofile } from "@prisma/client";

@Injectable()
export class TimetableRepository{
  constructor(private readonly prisma: PrismaService){}

  async getTimetables( user: session_userprofile, year?: number, semester?: number, paginationAndSorting?: {orderBy: Prisma.timetable_timetableOrderByWithRelationInput, skip: number, take: number}) {

    const skip = paginationAndSorting.skip;
    const take = paginationAndSorting.take;
    const orderBy = paginationAndSorting.orderBy;

    return await this.prisma.timetable_timetable.findMany({
      where:{
        year: year,
        semester: semester,
        user_id: user.id,
      },
      skip: skip,
      take: take,
      orderBy: orderBy,
    })
  }
}