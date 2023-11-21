import { Body, Controller, Post } from '@nestjs/common';
import { session_userprofile } from '@prisma/client';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { toJsonRate } from 'src/common/interfaces/serializer/rate.serializer';
import { IRate } from 'src/common/interfaces/structures';
import { RatesService } from './rates.service';

@Controller('rates')
export class RatesController {
  constructor(private readonly ratesService: RatesService) {}
  @Post()
  async createRates(
    @Body() body: IRate.CreateDto,
    @GetUser() user: session_userprofile,
  ): Promise<IRate> {
    const rate = await this.ratesService.createRate(body, user);
    return toJsonRate(rate);
  }
}
