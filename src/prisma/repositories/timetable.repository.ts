import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { Prisma, PrismaClient, session_userprofile } from "@prisma/client";
import {
  lectureDetails,
  LectureDetails,
  TimeTableBasic,
  timeTableDetails,
  TimeTableDetails
} from "../../common/schemaTypes/types";
import session from "express-session";

@Injectable()
export class TimetableRepository{
  constructor(private readonly prisma: PrismaService){}

  async getTimetables( user: session_userprofile, year?: number, semester?: number, paginationAndSorting?: {orderBy?: Prisma.timetable_timetableOrderByWithRelationInput[], skip?: number, take?: number}): Promise<TimeTableDetails[]> {

    const skip = paginationAndSorting?.skip;
    const take = paginationAndSorting?.take;
    const orderBy = paginationAndSorting?.orderBy;

    return await this.prisma.timetable_timetable.findMany({
      include: timeTableDetails.include,
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

  async getTimetableBasics(user: session_userprofile, year?: number, semester?: number, paginationAndSorting?: {orderBy: Prisma.timetable_timetableOrderByWithRelationInput, skip?: number, take?: number}): Promise<TimeTableBasic[]>{
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

  async createTimetable(user: session_userprofile, year: number, semester: number, arrangeOrder: number, lectures: LectureDetails[]): Promise<TimeTableDetails> {
    return await this.prisma.timetable_timetable.create({
      data:{
        user_id: user.id,
        year: year,
        semester: semester,
        arrange_order: arrangeOrder,
        timetable_timetable_lectures: {
          createMany:{
            data: lectures.map(lecture => {
              return {
                lecture_id: lecture.id,
              }
            })
          }
        }
      },
      include:timeTableDetails.include,
    })
  }

  async getTimeTableBasicById(timeTableId: number) {
    return await this.prisma.timetable_timetable.findUnique({
      where: {
        id: timeTableId
      }
    });
  }

  async addLectureToTimetable(timeTableId: number, lectureId: number) {
    return await this.prisma.timetable_timetable_lectures.create({
      data:{
        timetable_id: timeTableId,
        lecture_id: lectureId,
      }
    })
  }

  async getTimeTableById(timeTableId: number):Promise<TimeTableDetails>{
    return await this.prisma.timetable_timetable.findUnique({
      include: timeTableDetails.include,
      where: {
        id: timeTableId
      }
    });
  }

  async removeLectureFromTimetable(timeTableId: number, lectureId: number) {
    return await this.prisma.timetable_timetable_lectures.delete({
      where:{
        timetable_id_lecture_id: {
          timetable_id: timeTableId,
          lecture_id: lectureId,
        }
      }
    })
  }

  async deleteById(timetableId: number, tx?: PrismaClient ) {
    let prismaClient: PrismaClient = this.prisma;
    if(tx){
      prismaClient = tx;
    }
    await prismaClient.timetable_timetable_lectures.deleteMany({
      where:{
        timetable_id: timetableId
      }
    })
    return await prismaClient.timetable_timetable.delete({
      where:{
        id: timetableId
      }
    })
  }

  async updateOrder(id: number, arrange_order: number) {
    return await this.prisma.timetable_timetable.update({
      where:{
        id: id
      },
      data:{
        arrange_order: arrange_order
      }
    })
  }
}