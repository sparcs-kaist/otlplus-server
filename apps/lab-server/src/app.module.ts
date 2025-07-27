import { Module } from '@nestjs/common'
import { AppController } from '@otl/lab-server/app.controller'
import { AppService } from '@otl/lab-server/app.service'
import { FieldModule } from '@otl/lab-server/modules/field/field.module'
import { LabModule } from '@otl/lab-server/modules/lab/lab.module'
import { PaperModule } from '@otl/lab-server/modules/paper/paper.module'
import { WeaviateModule } from '@otl/weaviate-client'

import { PrismaModule } from '@otl/prisma-client'

import settings from './settings'

@Module({
  imports: [
    WeaviateModule.register(settings().weaviateConfig()),
    PrismaModule.register(settings().ormconfig()),
    LabModule,
    FieldModule,
    PaperModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
