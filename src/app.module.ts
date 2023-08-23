import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtCookieGuard } from './modules/auth/guard/jwt-cookie.guard';
import { AuthModule } from './modules/auth/auth.module';
import { MockAuthGuard } from './modules/auth/guard/mock-auth-guard';
import { JwtService } from '@nestjs/jwt';
import { CoursesModule } from './modules/courses/courses.module';
import { LecturesModule } from './modules/lectures/lectures.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { SemestersModule } from "./modules/semesters/semesters.module";
import { TimetablesModule } from "./modules/timetables/timetables.module";

@Module({
  imports: [PrismaModule, AuthModule, CoursesModule, LecturesModule,ReviewsModule,SemestersModule,TimetablesModule],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass:
        process.env.NODE_ENV === 'production' ? JwtCookieGuard : MockAuthGuard,
    },
    JwtCookieGuard,
    MockAuthGuard,
    AppService,
    JwtService,
  ],
})
export class AppModule {}
