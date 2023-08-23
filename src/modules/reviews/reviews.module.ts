import { PrismaModule } from './../../prisma/prisma.module';
import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { UserService } from '../user/user.service';

@Module({
  imports: [PrismaModule],
  controllers: [ReviewsController],
  providers: [ReviewsService, UserService],
})
export class ReviewsModule {}
