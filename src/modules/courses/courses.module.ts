import { Module } from '@nestjs/common';
import { CourseController } from './courses.controller';
import { CoursesService } from './courses.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CourseController],
  providers: [CoursesService],
})
export class CoursesModule {}
