import { Module } from '@nestjs/common';
import { FeedsController } from './feeds.controller';
import { FeedsService } from './feeds.service';
import { PrismaModule } from '@otl/prisma-client/prisma.module';
import { FeedsRepository } from '@otl/prisma-client/repositories';

@Module({
  imports: [PrismaModule],
  controllers: [FeedsController],
  providers: [FeedsService, FeedsRepository],
  exports: [FeedsService],
})
export class FeedsModule {}
