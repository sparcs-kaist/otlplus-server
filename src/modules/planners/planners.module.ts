import { Module } from '@nestjs/common';
import { PlannersController } from './planners.controller';
import { PlannersService } from './planners.service';

@Module({
  controllers: [PlannersController],
  providers: [PlannersService],
})
export class PlannersModule {}
