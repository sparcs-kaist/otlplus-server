import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ClsModule } from 'nestjs-cls';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthConfig } from './modules/auth/auth.config';
import { AuthModule } from './modules/auth/auth.module';
import { AuthGuard } from './modules/auth/guard/auth.guard';
import { JwtCookieGuard } from './modules/auth/guard/jwt-cookie.guard';
import { MockAuthGuard } from './modules/auth/guard/mock-auth-guard';
import { CoursesModule } from './modules/courses/courses.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { FeedsModule } from './modules/feeds/feeds.module';
import { LecturesModule } from './modules/lectures/lectures.module';
import { NoticesModule } from './modules/notices/notices.module';
import { PlannersModule } from './modules/planners/planners.module';
import { RatesModule } from './modules/rates/rates.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { SemestersModule } from './modules/semesters/semesters.module';
import { SessionModule } from './modules/session/session.module';
import { ShareModule } from './modules/share/share.module';
import { StatusModule } from './modules/status/status.module';
import { TimetablesModule } from './modules/timetables/timetables.module';
import { TracksModule } from './modules/tracks/tracks.module';
import { UserModule } from './modules/user/user.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { PrismaService } from '@otl/prisma-client/prisma.service';
import { PrismaModule } from '@otl/prisma-client/prisma.module';
import settings from './settings';

@Module({
  imports: [
    PrismaModule.register(settings().ormconfig()),
    AuthModule,
    CoursesModule,
    LecturesModule,
    ReviewsModule,
    UserModule,
    SemestersModule,
    TimetablesModule,
    RatesModule,
    StatusModule,
    FeedsModule,
    WishlistModule,
    NoticesModule,
    SessionModule,
    DepartmentsModule,
    PlannersModule,
    TracksModule,
    ShareModule,
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
      plugins: [
        new ClsPluginTransactional({
          imports: [PrismaModule],
          adapter: new TransactionalAdapterPrisma({
            prismaInjectionToken: PrismaService,
          }),
        }),
      ],
    }),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useFactory: async (authConfig: AuthConfig) => {
        const env = process.env.NODE_ENV === undefined ? 'prod' : process.env.NODE_ENV;
        const authChain = await authConfig.config(env);
        return new AuthGuard(authChain);
      },
      inject: [AuthConfig],
    },
    JwtCookieGuard,
    MockAuthGuard,
    AppService,
    JwtService,
  ],
})
export class AppModule {}
