import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  handleOrderPlaced(dto: any) {
    console.log(`Received a new msg - customer: ${JSON.stringify(dto)}`)
    // Send notification(fcm)
  }
}
