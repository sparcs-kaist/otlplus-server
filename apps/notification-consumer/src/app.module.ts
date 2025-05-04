import { Module } from '@nestjs/common'
import { AppController } from '@otl/notification-consumer/app.controller'
import { AppService } from '@otl/notification-consumer/app.service'

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
