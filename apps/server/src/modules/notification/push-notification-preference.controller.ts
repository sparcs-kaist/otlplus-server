import {
  Body, Controller, Get, Inject, Param, ParseIntPipe, Patch, Query,
} from '@nestjs/common'
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator'
import { IPushNotification } from '@otl/server-nest/common/interfaces/IPushNotification'
import {
  PUSH_NOTIFICATION_PREFERENCE_PORT,
  PushNotificationPreferencePort,
} from '@otl/server-nest/modules/notification/domain/push-notification.in.port'
import { session_userprofile } from '@prisma/client'

@Controller('push-notifications')
export class PushNotificationPreferenceController {
  constructor(
    @Inject(PUSH_NOTIFICATION_PREFERENCE_PORT)
    private readonly preferenceService: PushNotificationPreferencePort,
  ) {}

  @Get('preferences')
  async getPreferences(@GetUser() user: session_userprofile) {
    return this.preferenceService.getPreferences(user.id)
  }

  @Patch('preferences')
  async updatePreferences(@GetUser() user: session_userprofile, @Body() body: IPushNotification.UpdatePreferencesDto) {
    return this.preferenceService.updatePreferences(user.id, body)
  }

  @Patch('preferences/detail')
  async updateDetailPreference(
    @GetUser() user: session_userprofile,
    @Body() body: IPushNotification.UpdateDetailPreferenceDto,
  ) {
    return this.preferenceService.updateDetailPreference(user.id, body.notificationName, body.active)
  }

  @Get('history')
  async getHistory(@GetUser() user: session_userprofile, @Query() query: IPushNotification.HistoryQueryDto) {
    return this.preferenceService.getHistory(user.id, query.cursor, query.limit)
  }

  @Patch('history/:id/read')
  async markAsRead(@GetUser() user: session_userprofile, @Param('id', ParseIntPipe) id: number) {
    await this.preferenceService.markAsRead(user.id, id)
    return { success: true }
  }
}
