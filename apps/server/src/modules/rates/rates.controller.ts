import { Body, Controller, Post } from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { GetUser } from '@src/common/decorators/get-user.decorator';
import { IRate } from '@otl/api-interface/src/interfaces/IRate';
import { RatesService } from './rates.service';
import { toJsonRate } from '@src/common/serializer/rate.serializer';

@Controller('api/rates')
export class RatesController {
  constructor(private readonly ratesService: RatesService) {}
  @Post()
  async createRates(@Body() body: IRate.CreateDto, @GetUser() user: session_userprofile): Promise<IRate.Basic> {
    const rate = await this.ratesService.createRate(body, user);
    return toJsonRate(rate);
  }
}
