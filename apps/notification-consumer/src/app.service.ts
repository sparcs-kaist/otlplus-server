import { Injectable } from '@nestjs/common'
import { AppDto } from '@otl/notification-consumer/dto'

@Injectable()
export class AppService {
  handleOrderPlaced(dto: AppDto) {
    console.log(`Received a new order - customer: ${dto}`)
    // Send notification(fcm)
  }
}
