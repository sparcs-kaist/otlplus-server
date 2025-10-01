import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { Transactional } from '@nestjs-cls/transactional'
import { ITimetableV2 } from '@otl/server-nest/common/interfaces/v2'
import { session_userprofile } from '@prisma/client'

import { TimetableRepository } from '@otl/prisma-client/repositories'

@Injectable()
export class TimetablesServiceV2 {
  constructor(private readonly timetableRepository: TimetableRepository) {}

  // this updates name of timetable or order of timetable
  // at least one of name or order must be provided
  // throw 400 if neither is provided or timetableID is invalid
  // throw 401 if user is unauthorized (if user.id !== timetable.user_id)
  // return 200 if successful, no content
  @Transactional()
  async updateTimetable(
    user: session_userprofile,
    body: ITimetableV2.UpdateReqDto,
  ): Promise<ITimetableV2.UpdateResDto> {
    const { timetableId, name, order } = body
    const timetable = await this.timetableRepository.getTimeTableById(timetableId)
    if (timetable.user_id !== user.id) {
      throw new UnauthorizedException('Current user does not match owner of requested timetable')
    }
    if (!name && !order) {
      throw new BadRequestException('At least one of name or order must be provided')
    }
    // separate update order and update name
    if (order) {
      await this.timetableRepository.updateOrder(timetableId, order)
    }
    // todo: implement updateName
    if (name) {
      // await this.timetableRepository.updateName(timetableId, name)
    }
    return {
      message: 'Timetable updated successfully',
    }
  }
}
