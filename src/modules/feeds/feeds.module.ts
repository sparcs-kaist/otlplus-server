import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FeedsRepository } from 'src/prisma/repositories/feeds.repository';
import { FeedsController } from './feeds.controller';
import { FeedsService } from './feeds.service';

@Module({
  imports: [PrismaModule],
  controllers: [FeedsController],
  providers: [FeedsService, FeedsRepository],
  exports: [FeedsService],
})
export class FeedsModule {}
