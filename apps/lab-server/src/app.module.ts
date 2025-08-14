import { Module } from '@nestjs/common'
import { ClsPluginTransactional } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { AppController } from '@otl/lab-server/app.controller'
import { AppService } from '@otl/lab-server/app.service'
import { FieldModule } from '@otl/lab-server/modules/field/field.module'
import { LabModule } from '@otl/lab-server/modules/lab/lab.module'
import { PaperModule } from '@otl/lab-server/modules/paper/paper.module'
import { WeaviateModule } from '@otl/weaviate-client'
import { ClsModule } from 'nestjs-cls'

import { PrismaModule, PrismaService } from '@otl/prisma-client'

import settings from './settings'

@Module({
  imports: [
    WeaviateModule.register(settings().weaviateConfig()),
    PrismaModule.register(settings().ormConfig()),
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
    LabModule,
    FieldModule,
    PaperModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
