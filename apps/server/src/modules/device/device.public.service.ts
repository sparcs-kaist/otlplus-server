import { DeviceInPublicPort } from '@otl/server-nest/modules/device/domain/device.in.public.port'
import { DeviceRepository } from '@otl/server-nest/modules/device/domain/device.repository'
import { StatusCodes } from 'http-status-codes'

import { OtlException } from '@otl/common/exception/otl.exception'

export class DevicePublicService implements DeviceInPublicPort {
  constructor(protected readonly deviceRepository: DeviceRepository) {}

  getDeviceToken(_userId: number): Promise<any> {
    return Promise.resolve({})
  }

  checkExistDevice(_deviceToken: string): Promise<any> {
    return Promise.resolve({})
  }

  sendNotification(_deviceToken: string, _title: string, _body: string): Promise<any> {
    return Promise.resolve({})
  }

  sendNotificationToAll(_title: string, _body: string): Promise<any[]> {
    throw new OtlException(StatusCodes.NOT_IMPLEMENTED)
  }

  checkNotificationCompleted(_userId: number, _notificationRequestId: number): Promise<any> {
    return Promise.resolve({})
  }

  checkNotificationPermission(_userId: number, _notificationId: number): Promise<any> {
    return Promise.resolve({})
  }
}
