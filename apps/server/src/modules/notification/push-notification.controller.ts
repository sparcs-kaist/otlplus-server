import {
  Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Patch, Post,
} from '@nestjs/common'
import { Admin } from '@otl/server-nest/common/decorators/admin.decorator'
import { IPushNotification } from '@otl/server-nest/common/interfaces/IPushNotification'
import {
  NotificationPriority,
  NotificationScheduleType,
  NotificationTargetType,
} from '@otl/server-nest/modules/notification/domain/push-notification.enums'
import {
  PUSH_NOTIFICATION_IN_PORT,
  PushNotificationInPort,
} from '@otl/server-nest/modules/notification/domain/push-notification.in.port'

import { AgreementType } from '@otl/common/enum/agreement'

@Controller('admin/push-notifications')
export class PushNotificationController {
  constructor(
    @Inject(PUSH_NOTIFICATION_IN_PORT)
    private readonly pushNotificationService: PushNotificationInPort,
  ) {}

  @Admin()
  @Post()
  async create(@Body() body: IPushNotification.CreateDto) {
    return this.pushNotificationService.createPushNotification({
      name: body.name,
      type: body.type as AgreementType,
      titleTemplate: body.titleTemplate,
      bodyTemplate: body.bodyTemplate,
      targetType: body.targetType as NotificationTargetType,
      targetFilter: body.targetFilter,
      scheduleType: body.scheduleType as NotificationScheduleType,
      scheduleAt: body.scheduleAt,
      cronExpression: body.cronExpression,
      priority: (body.priority as NotificationPriority) ?? undefined,
      digestKey: body.digestKey,
      digestWindowSec: body.digestWindowSec,
      isActive: body.isActive,
    })
  }

  @Admin()
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: IPushNotification.UpdateDto) {
    return this.pushNotificationService.updatePushNotification(id, body as any)
  }

  @Admin()
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.pushNotificationService.deletePushNotification(id)
  }

  @Admin()
  @Get()
  async list() {
    return this.pushNotificationService.listPushNotifications()
  }

  @Admin()
  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number) {
    return this.pushNotificationService.getPushNotification(id)
  }

  @Admin()
  @Post(':id/send')
  async send(@Param('id', ParseIntPipe) id: number, @Body() body: IPushNotification.SendDto) {
    return this.pushNotificationService.sendNotificationNow(id, body.templateVars)
  }

  @Admin()
  @Get(':id/status')
  async status(@Param('id', ParseIntPipe) id: number) {
    return this.pushNotificationService.getDeliveryStatus(id)
  }
}
