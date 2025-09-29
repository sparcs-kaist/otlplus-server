import { Injectable } from '@nestjs/common'
import { ITimetableV2 } from '@otl/server-nest/common/interfaces/v2'
import { session_userprofile } from '@prisma/client'

import { TimetableRepository } from '@otl/prisma-client'

@Injectable()
export class TimetablesServiceV2 {
  constructor(private readonly timetableRepository: TimetableRepository) {}

  async getTimetables(query: ITimetableV2.QueryDto, user: session_userprofile) {
    return await this.timetableRepository.getTimetableBasics(user)
  }
}
