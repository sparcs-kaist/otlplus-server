import { Module } from '@nestjs/common';
import { CourseController } from './courses.controller';
import { CoursesService } from './courses.service';
import { PrismaModule } from '@otl/prisma-client/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CourseController],
  providers: [CoursesService],
})
export class CoursesModule {}
