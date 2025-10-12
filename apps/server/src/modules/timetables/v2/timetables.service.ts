import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { ITimetableV2 } from '@otl/server-nest/common/interfaces/v2'
import { Prisma, session_userprofile } from '@prisma/client'

import { TimetableRepository } from '@otl/prisma-client'

@Injectable()
export class TimetablesServiceV2 {
  constructor(private readonly timetableRepository: TimetableRepository) {}

  async getTimetables(query: ITimetableV2.QueryDto, user: session_userprofile) {
    return await this.timetableRepository.getTimetableBasics(user)
  }

  async deleteTimetable(user: session_userprofile, body: ITimetableV2.DeleteReqDto) {
    const { id } = body
    // if timetableId is invalid, throw 400
    if (id === undefined) {
      throw new BadRequestException('Timetable ID is required')
    }
    try {
      const timetable = await this.timetableRepository.getTimeTableById(id)
      // if user is not owner of timetable, throw 401
      if (timetable.user_id !== user.id) {
        throw new UnauthorizedException('Current user does not match owner of requested timetable')
      }
    }
    catch (error) {
      // catch prisma.timetable_timetable.findUniqueOrThrow() + not found, throw 400
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new BadRequestException('TimetableID is invalid')
        }
      }
      else {
        throw error
      }
    }

    // delete timetable
    await this.timetableRepository.deleteById(id)
    return {
      message: 'Timetable deleted successfully',
    }
  }

  // this updates name of timetable or order of timetable
  // at least one of name or order must be provided
  // throw 400 if neither is provided or timetableID is invalid
  // throw 401 if user is unauthorized (if user.id !== timetable.user_id)
  // return 200 if successful, no content
  // @Transactional() // Temporarily disabled for testing
  async updateTimetable(
    user: session_userprofile,
    body: ITimetableV2.UpdateReqDto,
  ): Promise<ITimetableV2.UpdateResDto> {
    const { id, name, order } = body
    // do i need to handle if timetableId is invalid or leave it to runtime error -> sentry?
    // todo: check this
    const timetable = await this.timetableRepository.getTimeTableById(id)
    console.log('Found timetable:', timetable) // Debug log
    if (timetable.user_id !== user.id) {
      throw new UnauthorizedException('Current user does not match owner of requested timetable')
    }
    if (name === undefined && order === undefined) {
      throw new BadRequestException('At least one of name or order must be provided')
    }
    // separate update order and update name
    // is order 0-based or 1-based?
    // todo: check this (assume 0-based for now)
    if (order !== undefined) {
      console.log('Updating order to:', order) // Debug log
      await this.timetableRepository.updateOrder(id, order)
      console.log('Order update completed') // Debug log
    }
    if (name !== undefined) {
      console.log('Updating name to:', name) // Debug log
      await this.timetableRepository.updateName(id, name)
      console.log('Name update completed') // Debug log
    }
    return {
      message: 'Timetable updated successfully',
    }
  }
}
