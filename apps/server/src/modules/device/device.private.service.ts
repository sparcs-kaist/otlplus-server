import { Inject } from '@nestjs/common'
import { DevicePublicService } from '@otl/server-nest/modules/device/device.public.service'
import { UserDevice } from '@otl/server-nest/modules/device/domain/device'
import { DeviceInPrivatePort } from '@otl/server-nest/modules/device/domain/device.in.private.port'
import { DeviceInPublicPort } from '@otl/server-nest/modules/device/domain/device.in.public.port'
import { DEVICE_REPOSITORY, DeviceRepository } from '@otl/server-nest/modules/device/domain/device.repository'
import { StatusCodes } from 'http-status-codes'

import { OtlException } from '@otl/common/exception/otl.exception'

export class DevicePrivateService extends DevicePublicService implements DeviceInPublicPort, DeviceInPrivatePort {
  constructor(
    @Inject(DEVICE_REPOSITORY)
    protected readonly deviceRepository: DeviceRepository,
  ) {
    super(deviceRepository)
  }

  makeDeviceTokenActive(_userId: number, _deviceToken: string): Promise<UserDevice> {
    throw new OtlException(StatusCodes.NOT_IMPLEMENTED)
  }

  makeDeviceTokenInactive(_userId: number, _deviceToken: string): Promise<UserDevice> {
    throw new OtlException(StatusCodes.NOT_IMPLEMENTED)
  }

  registerDevice(
    _userId: number,
    _deviceToken: string,
    _deviceType?: string | null,
    _deviceOsVersion?: string,
    _appVersion?: string,
  ): Promise<UserDevice> {
    throw new OtlException(StatusCodes.NOT_IMPLEMENTED)
  }

  unregisterDevice(_userId: number, _deviceToken: string): Promise<void> {
    throw new OtlException(StatusCodes.NOT_IMPLEMENTED)
  }
}
