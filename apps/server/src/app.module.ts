import { createKeyv, Keyv } from '@keyv/redis'
import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { ClsPluginTransactional } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { SentryModule } from '@sentry/nestjs/setup'
import * as Sentry from '@sentry/node'
import { CacheableMemory } from 'cacheable'
import IORedis from 'ioredis'
import { ClsModule } from 'nestjs-cls'

import logger from '@otl/common/logger/logger'
import { LoggingInterceptor } from '@otl/common/logger/logging.interceptor'

import { PrismaModule } from '@otl/prisma-client/prisma.module'
import { PrismaService } from '@otl/prisma-client/prisma.service'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthConfig } from './modules/auth/auth.config'
import { AuthModule } from './modules/auth/auth.module'
import { AuthGuard } from './modules/auth/guard/auth.guard'
import { JwtCookieGuard } from './modules/auth/guard/jwt-cookie.guard'
import { MockAuthGuard } from './modules/auth/guard/mock-auth-guard'
import { CoursesModule } from './modules/courses/courses.module'
import { DepartmentsModule } from './modules/departments/departments.module'
import { FeedsModule } from './modules/feeds/feeds.module'
import { LecturesModule } from './modules/lectures/lectures.module'
import { NoticesModule } from './modules/notices/notices.module'
import { PlannersModule } from './modules/planners/planners.module'
import { RatesModule } from './modules/rates/rates.module'
import { ReviewsModule } from './modules/reviews/reviews.module'
import { SemestersModule } from './modules/semesters/semesters.module'
import { SessionModule } from './modules/session/session.module'
import { ShareModule } from './modules/share/share.module'
import { StatusModule } from './modules/status/status.module'
import { TimetablesModule } from './modules/timetables/timetables.module'
import { TracksModule } from './modules/tracks/tracks.module'
import { UserModule } from './modules/user/user.module'
import { WishlistModule } from './modules/wishlist/wishlist.module'
import settings from './settings'

async function createCacheStoreWithFallback(): Promise<Keyv> {
  const { url, password } = settings().getRedisConfig()

  const redisClient = new IORedis(url as string, { password, maxRetriesPerRequest: 5 })

  try {
    await redisClient.ping() // 실제 Redis 연결 확인

    const redisStore = createKeyv({ url, password })
    logger.info('[CacheModule] Redis 연결 성공')
    return redisStore
  }
  catch (err) {
    logger.error('[CacheModule] Redis 연결 실패, In-Memory Cache로 대체합니다:', err)
    Sentry.captureException(err)
    return new Keyv({
      store: new CacheableMemory({ ttl: '60m', lruSize: 5000 }),
    }) // fallback: 메모리 캐시
  }
  finally {
    redisClient.disconnect()
  }
}

@Module({
  imports: [
    SentryModule.forRoot(),
    PrismaModule.register(settings().ormconfig(), settings().ormReplicatedConfig()),
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
    CacheModule.registerAsync({
      useFactory: async () => ({
        stores: [await createCacheStoreWithFallback()],
      }),
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useFactory: async (authConfig: AuthConfig) => {
        const env = process.env.NODE_ENV === undefined ? 'prod' : process.env.NODE_ENV
        const authChain = await authConfig.config(env)
        return new AuthGuard(authChain)
      },
      inject: [AuthConfig],
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    JwtCookieGuard,
    MockAuthGuard,
    AppService,
    JwtService,
  ],
})
export class AppModule {}
