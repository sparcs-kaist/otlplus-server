import { Module } from '@nestjs/common'
import { ClsPluginTransactional } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { RmqConnectionModule } from '@otl/rmq'
import { AppController } from '@otl/server-consumer/app.controller'
import { AppService } from '@otl/server-consumer/app.service'
import { CourseModule } from '@otl/server-consumer/modules/course/course.module'
import { LectureModule } from '@otl/server-consumer/modules/lecture/lecture.module'
import { ProfessorModule } from '@otl/server-consumer/modules/professor/professor.module'
import { ReviewModule } from '@otl/server-consumer/modules/review/review.module'
import settings from '@otl/server-consumer/settings'
import { ClsModule } from 'nestjs-cls'

import { PrismaModule, PrismaService } from '@otl/prisma-client'

@Module({
  imports: [
    RmqConnectionModule.register(),
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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
