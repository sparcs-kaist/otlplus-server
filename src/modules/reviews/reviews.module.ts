import { Module } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { PrismaModule } from './../../prisma/prisma.module';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [PrismaModule],
  controllers: [ReviewsController],
  providers: [ReviewsService, UserService],
})
export class ReviewsModule {}
