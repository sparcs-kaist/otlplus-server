import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { IPersonal } from '@otl/server-nest/common/interfaces'
import { makeDBtoTimeBlockDay, makeTimeIndexToTime } from '@otl/server-nest/common/utils/time.utils'
import { session_userprofile } from '@prisma/client'

import { TimeTableColorEnum } from '@otl/common/enum/color'

import { PersonalsRepository } from '@otl/prisma-client/repositories/personal.repository'

@Injectable()
export class PersonalsService {
  constructor(private readonly personalsRepository: PersonalsRepository) {}

  async createPersonal(user: session_userprofile, personal: IPersonal.CreateDto) {
    const created = await this.personalsRepository.createPersonalBlock({
      ...personal,
      user_id: user.id,
    })
    return created
  }

  async patchPersonal(user: session_userprofile, id: number, personal: IPersonal.UpdateDto): Promise<IPersonal.Block> {
    // auth check
    const personalBlock = await this.personalsRepository.findPersonalBlockById(id)

    if (!personalBlock) {
      throw new NotFoundException('Personal not found')
    }

    if (personalBlock.user_id !== user.id) {
      throw new ForbiddenException('You are not allowed to update this personal block')
    }

    const updated = await this.personalsRepository.updatePersonalBlock({
      id,
      ...personal,
    })
    return {
      ...updated,
      color: updated.color as TimeTableColorEnum,
      timeBlock: updated.personal_timeblocks.map((timeBlock) => {
        const day = makeDBtoTimeBlockDay(timeBlock.day, timeBlock.weekday)
        return {
          day: day ?? null,
          weekday: day ?? null,
          timeIndex: timeBlock.time_index,
          startTime: makeTimeIndexToTime(timeBlock.time_index),
          endTime: makeTimeIndexToTime(timeBlock.time_index + 1),
        }
      }),
    }
  }

  async deletePersonal(user: session_userprofile, id: number): Promise<boolean> {
    // auth check
    const personalBlock = await this.personalsRepository.findPersonalBlockById(id)

    if (!personalBlock) {
      throw new NotFoundException('Personal not found')
    }

    if (personalBlock.user_id !== user.id) {
      throw new ForbiddenException('You are not allowed to delete this personal block')
    }

    await this.personalsRepository.deletePersonalBlock(id)
    return true
  }
}
