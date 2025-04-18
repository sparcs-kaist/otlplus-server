import { Body, Controller, Post } from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator';
import { RatesService } from './rates.service';
import { toJsonRate } from '@otl/server-nest/common/serializer/rate.serializer';
import { IRate } from '@otl/server-nest/common/interfaces';

@Controller('api/rates')
export class RatesController {
  constructor(private readonly ratesService: RatesService) {}
  @Post()
  async createRates(@Body() body: IRate.CreateDto, @GetUser() user: session_userprofile): Promise<IRate.Basic> {
    const rate = await this.ratesService.createRate(body, user);
    return toJsonRate(rate);
  }
}
