import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PersonalsController } from './personals.controller';
import { PersonalsService } from './personals.service';

@Module({
  imports: [PrismaModule],
  controllers: [PersonalsController],
  providers: [PersonalsService],
})
export class PersonalsModule {}
