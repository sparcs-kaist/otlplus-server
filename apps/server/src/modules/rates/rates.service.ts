import { BadRequestException, Injectable } from '@nestjs/common'
import { Transactional } from '@nestjs-cls/transactional'
import { IRate } from '@otl/server-nest/common/interfaces'
import settings from '@otl/server-nest/settings'
import { session_userprofile, support_rate } from '@prisma/client'

import { RateRepository } from '@otl/prisma-client/repositories'

@Injectable()
export class RatesService {
  constructor(private readonly rateRepository: RateRepository) {}

  @Transactional()
  async createRate(body: IRate.CreateDto, user: session_userprofile): Promise<support_rate> {
    const { score } = body
    const year = new Date().getFullYear()
    const version = settings().getVersion()

    const rate = await this.rateRepository.getRate(user.id, year, version)
    if (rate) {
      throw new BadRequestException('You already rated for current year')
    }

    const newRate = await this.rateRepository.createRate(user.id, score, year, version)
    return newRate
  }
}
