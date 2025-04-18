import { Module } from '@nestjs/common';
import { PlannersController } from './planners.controller';
import { PlannersService } from './planners.service';
import { PrismaModule } from '@otl/prisma-client/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PlannersController],
  providers: [PlannersService],
})
export class PlannersModule {}
