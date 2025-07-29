import { Module } from '@nestjs/common'
import { ClsPluginTransactional } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { RmqModule } from '@otl/rmq'
import { AppController } from '@otl/server-consumer/app.controller'
import { AppService } from '@otl/server-consumer/app.service'
import { DeadLetterController } from '@otl/server-consumer/dead-letter.controller'
// import { DeadLetterController } from '@otl/server-consumer/dead-letter.controller'
import { CourseModule } from '@otl/server-consumer/modules/course/course.module'
import { LectureModule } from '@otl/server-consumer/modules/lecture/lecture.module'
import { ProfessorModule } from '@otl/server-consumer/modules/professor/professor.module'
import { ReviewModule } from '@otl/server-consumer/modules/review/review.module'
import settings from '@otl/server-consumer/settings'
import { SentryModule } from '@sentry/nestjs/setup'
import { ClsModule } from 'nestjs-cls'

import { PrismaModule, PrismaService } from '@otl/prisma-client'

@Module({
  imports: [
    SentryModule.forRoot(),
    RmqModule,
    PrismaModule.register(settings().ormconfig(), settings().ormReplicatedConfig()),
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
    LectureModule,
    ReviewModule,
    ProfessorModule,
    CourseModule,
  ],
  controllers: [],
  providers: [AppService, AppController, DeadLetterController],
})
export class AppModule {}
