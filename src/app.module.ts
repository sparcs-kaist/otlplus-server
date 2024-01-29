import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { JwtCookieGuard } from './modules/auth/guard/jwt-cookie.guard';
import { MockAuthGuard } from './modules/auth/guard/mock-auth-guard';
import { CoursesModule } from './modules/courses/courses.module';
import { FeedsModule } from './modules/feeds/feeds.module';
import { LecturesModule } from './modules/lectures/lectures.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { SemestersModule } from './modules/semesters/semesters.module';
import { StatusModule } from './modules/status/status.module';
import { TimetablesModule } from './modules/timetables/timetables.module';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CoursesModule,
    LecturesModule,
    ReviewsModule,
    UserModule,
    SemestersModule,
    TimetablesModule,
    StatusModule,
    FeedsModule,
  ],
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
