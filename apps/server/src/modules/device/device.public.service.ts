import { UserDevice } from '@otl/server-nest/modules/device/domain/device'
import { DeviceInPublicPort } from '@otl/server-nest/modules/device/domain/device.in.public.port'
import { DeviceRepository } from '@otl/server-nest/modules/device/domain/device.repository'
import { StatusCodes } from 'http-status-codes'

import { getCurrentMethodName } from '@otl/common'
import { UserException } from '@otl/common/exception/user.exception'

export class DevicePublicService implements DeviceInPublicPort {
  constructor(protected readonly deviceRepository: DeviceRepository) {}

  async getDeviceToken(userId: number): Promise<UserDevice[]> {
    const tokens = await this.deviceRepository.findByUserId(userId)
    if (tokens === null) {
      throw new UserException(
        StatusCodes.INTERNAL_SERVER_ERROR,
        UserException.DEVICE_NOT_FOUND,
        getCurrentMethodName(),
      )
    }
    return tokens
  }

  async checkExistDevice(deviceToken: string): Promise<UserDevice> {
    const userDevices = await this.deviceRepository.findByToken(deviceToken)
    if (userDevices === null) {
      throw new UserException(
        StatusCodes.INTERNAL_SERVER_ERROR,
        UserException.DEVICE_NOT_FOUND,
        getCurrentMethodName(),
      )
    }
    else if (userDevices.length > 1) {
      throw new UserException(
        StatusCodes.INTERNAL_SERVER_ERROR,
        UserException.DEVICE_DUPLICATE,
        getCurrentMethodName(),
      )
    }
    return userDevices[0]
  }

  // sendNotification(_deviceToken: string, _title: string, _body: string): Promise<any> {
  //   return Promise.resolve({})
  // }
  //
  // sendNotificationToAll(_title: string, _body: string): Promise<any[]> {
  //   throw new OtlException(StatusCodes.NOT_IMPLEMENTED)
  // }
  //
  // checkNotificationCompleted(_userId: number, _notificationRequestId: number): Promise<any> {
  //   return Promise.resolve({})
  // }
  //
  // checkNotificationPermission(_userId: number, _notificationId: number): Promise<any> {
  //   return Promise.resolve({})
  // }
}
