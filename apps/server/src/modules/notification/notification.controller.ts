import {
  Body, Controller, Delete, Get, Inject, Param, Patch, Post,
} from '@nestjs/common'
import { Admin } from '@otl/server-nest/common/decorators/admin.decorator'
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator'
import { Public } from '@otl/server-nest/common/decorators/skip-auth.decorator'
import { INotification } from '@otl/server-nest/common/interfaces/INotification'
import { AGREEMENT_IN_PUBLIC_PORT } from '@otl/server-nest/modules/agreement/domain/agreement.in.port'
import { AgreementInPublicPort } from '@otl/server-nest/modules/agreement/domain/agreement.in.public.port'
import {
  NOTIFICATION_IN_PORT,
  NotificationInPort,
} from '@otl/server-nest/modules/notification/domain/notification.in.port'
import { session_userprofile } from '@prisma/client'
import { v6 } from 'uuid'

@Controller('notification')
export class NotificationController {
  constructor(
    @Inject(NOTIFICATION_IN_PORT)
    private readonly notificationService: NotificationInPort,

    @Inject(AGREEMENT_IN_PUBLIC_PORT)
    private readonly agreementService: AgreementInPublicPort,
  ) {}

  @Public()
  @Get('/hello')
  async getHello() {
    return await this.notificationService.sendNotification(v6(), 'Hello', 'Hello', {
      userId: 17931,
      scheduleAt: new Date(),
      notificationName: 'COURSE_TIME',
    })
  }

  @Post('/read')
  async read(@GetUser() user: session_userprofile, @Body() body: INotification.ReadDto) {
    const notificationRequest = await this.notificationService.getNotificationRequest(body.requestUUID)
    return await this.notificationService.readNotification(user.id, notificationRequest.id as number)
  }

  @Patch('/user')
  async allowOrDisallow(@GetUser() user: session_userprofile, @Body() body: INotification.ActiveDto) {
    return await this.notificationService.changeNotificationPermission(user.id, body.notificationType, body.active)
  }

  @Admin()
  @Get('/agreements')
  async getAgreements() {
    return await this.agreementService.getAllAgreements()
  }

  @Admin()
  @Post()
  async createNotification(@Body() body: INotification.CreateDto) {
    return await this.notificationService.createNotification(body.name, body.description, body.agreementType)
  }

  @Admin()
  @Patch()
  async updateNotification(@Body() body: INotification.UpdateDto) {
    return await this.notificationService.updateNotification(body.id, body.name, body.description, body.agreementType)
  }

  @Admin()
  @Delete()
  async deleteNotification(@Body() body: INotification.DeleteDto) {
    return await this.notificationService.deleteNotification(body.id)
  }

  @Admin()
  @Get()
  async getAllNotifications() {
    return await this.notificationService.getAllNotification()
  }

  @Admin()
  @Get('/:name')
  async getNotification(@Param('name') name: string) {
    return await this.notificationService.getNotification(name)
  }
}
