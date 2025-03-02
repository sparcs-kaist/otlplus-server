import { BadRequestException, Injectable } from '@nestjs/common';
import { session_userprofile, support_rate } from '@prisma/client';
import { RateRepository } from '@src/prisma/repositories/rates.repository';
import settings from '@src/settings';
import { Transactional } from '@nestjs-cls/transactional';
import { IRate } from '@otl/api-interface/src/interfaces';

@Injectable()
export class RatesService {
  constructor(private readonly rateRepository: RateRepository) {}
  @Transactional()
  async createRate(body: IRate.CreateDto, user: session_userprofile): Promise<support_rate> {
    const { score } = body;
    const year = new Date().getFullYear();
    const version = settings().getVersion();

    const rate = await this.rateRepository.getRate(user.id, year, version);
    if (rate) {
      throw new BadRequestException('You already rated for current year');
    }

    const newRate = await this.rateRepository.createRate(user.id, score, year, version);
    return newRate;
  }
}
