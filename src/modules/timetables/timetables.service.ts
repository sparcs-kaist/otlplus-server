import { Injectable } from '@nestjs/common';
import { TimetableRepository } from "../../prisma/repositories/timetable.repository";
import { session_userprofile } from "@prisma/client";
import { TimeTableQueryDto } from "../../common/interfaces/dto/timetable/timetable.request.dto";

@Injectable()
export class TimetablesService {
  constructor(
    private readonly timetableRepository: TimetableRepository,
  ) {
  }

  async getTimetables(query: TimeTableQueryDto, user: session_userprofile ) {
    const {year, semester, order, offset, limit} = query;

    const orderBy = {};
    order.forEach((order) => {
      orderBy[order] = 'asc'
    })

    const paginationAndSorting = {
      skip: offset,
      take: limit,
      orderBy: orderBy
    }

    const timetables = await this.timetableRepository.getTimetables(user, year, semester, paginationAndSorting);
    return timetables;
  }



}
