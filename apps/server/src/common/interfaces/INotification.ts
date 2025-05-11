import { IsIn, IsNotEmpty } from 'class-validator'

import { NotificationType } from '@otl/common/enum/notification'

export namespace INotification {
  export class ReadDto {
    @IsNotEmpty()
    requestUUID!: string
  }
  export class ActiveDto {
    @IsNotEmpty()
    active!: boolean

    @IsIn(Object.values(NotificationType))
    @IsNotEmpty()
    notificationType!: NotificationType
  }
}
