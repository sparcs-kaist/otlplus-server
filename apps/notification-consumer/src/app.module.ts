import { Module } from '@nestjs/common'
import { AppController } from '@otl/notification-consumer/app.controller'
import { AppService } from '@otl/notification-consumer/app.service'
import { RmqModule } from '@otl/rmq/rmq.module'

@Module({
  imports: [RmqModule.register()],
  controllers: [],
  providers: [AppService, AppController],
})
export class AppModule {}
