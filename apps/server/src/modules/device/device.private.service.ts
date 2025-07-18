import { Inject } from '@nestjs/common'
import { DevicePublicService } from '@otl/server-nest/modules/device/device.public.service'
import { DeviceType, UserDevice } from '@otl/server-nest/modules/device/domain/device'
import { DeviceInPrivatePort } from '@otl/server-nest/modules/device/domain/device.in.private.port'
import { DeviceInPublicPort } from '@otl/server-nest/modules/device/domain/device.in.public.port'
import { DEVICE_REPOSITORY, DeviceRepository } from '@otl/server-nest/modules/device/domain/device.repository'
import { StatusCodes } from 'http-status-codes'

import { getCurrentMethodName } from '@otl/common'
import { UserException } from '@otl/common/exception/user.exception'

export class DevicePrivateService extends DevicePublicService implements DeviceInPublicPort, DeviceInPrivatePort {
  constructor(
    @Inject(DEVICE_REPOSITORY)
    protected readonly deviceRepository: DeviceRepository,
  ) {
    super(deviceRepository)
  }

  async makeDeviceTokenActive(userId: number, deviceToken: string): Promise<UserDevice> {
    const target = await this.deviceRepository.findByUserIdAndToken(userId, deviceToken)
    if (target === null) {
      throw new UserException(StatusCodes.INTERNAL_SERVER_ERROR, UserException.DEVICE_NOT_FOUND, getCurrentMethodName())
    }
    target.isActive = true
    return await this.deviceRepository.save(target)
  }

  async makeDeviceTokenInactive(userId: number, deviceToken: string): Promise<UserDevice> {
    const target = await this.deviceRepository.findByUserIdAndToken(userId, deviceToken)
    if (target === null) {
      throw new UserException(StatusCodes.INTERNAL_SERVER_ERROR, UserException.DEVICE_NOT_FOUND, getCurrentMethodName())
    }
    target.isActive = false
    return await this.deviceRepository.save(target)
  }

  async registerDevice(
    userId: number,
    deviceToken: string,
    isActive: boolean,
    deviceType?: DeviceType | null,
    deviceOsVersion?: string,
    appVersion?: string,
  ): Promise<UserDevice> {
    const deviceTokens = await this.deviceRepository.findByToken(deviceToken)
    if (deviceTokens === null) {
      return await this.deviceRepository.save({
        userId,
        deviceToken: deviceToken ?? null,
        deviceType: deviceType ?? null,
        deviceOsVersion: deviceOsVersion ?? null,
        appVersion: appVersion ?? null,
        isActive,
      })
    }
    await this.deviceRepository.deleteMany(deviceTokens)
    return await this.deviceRepository.save({
      userId,
      deviceToken: deviceToken ?? null,
      deviceType: deviceType ?? null,
      deviceOsVersion: deviceOsVersion ?? null,
      appVersion: appVersion ?? null,
      isActive,
    })
  }

  async unregisterDevice(userId: number, deviceToken: string): Promise<void> {
    const token = await this.deviceRepository.findByUserIdAndToken(userId, deviceToken)
    if (token === null) {
      throw new UserException(StatusCodes.INTERNAL_SERVER_ERROR, UserException.DEVICE_NOT_FOUND, getCurrentMethodName())
    }
    await this.deviceRepository.delete(token)
  }
}
