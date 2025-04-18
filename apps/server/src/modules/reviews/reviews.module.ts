import { Module } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { PrismaModule } from '@otl/prisma-client/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReviewsController],
  providers: [ReviewsService, UserService],
})
export class ReviewsModule {}
