import {
  Body, Controller, Delete, Get, Inject, Patch, Post, Query,
} from '@nestjs/common'
import { GetUser } from '@otl/server-nest/common/decorators/get-user.decorator'
import { IDevice } from '@otl/server-nest/common/interfaces/IDevice'
import { DEVICE_IN_PORT, DeviceInPort } from '@otl/server-nest/modules/device/domain/device.in.port'
import { StatusCodes } from 'http-status-codes'

import { getCurrentMethodName } from '@otl/common'
import { UserException } from '@otl/common/exception/user.exception'

@Controller('device')
export class DeviceController {
  constructor(
    @Inject(DEVICE_IN_PORT)
    private readonly notificationInPort: DeviceInPort,
  ) {}

  @Post('/')
  public async registerDevice(
    @GetUser() user: any,
    @Body() registerDeviceDto: IDevice.RegisterDeviceDto,
  ): Promise<IDevice.Response.DeviceResponseDto> {
    const {
      deviceToken, deviceType, deviceOsVersion, appVersion, isActive,
    } = registerDeviceDto
    return await this.notificationInPort.registerDevice(
      user.id,
      deviceToken,
      isActive,
      deviceType,
      deviceOsVersion,
      appVersion,
    )
  }

  @Delete('/')
  public async unregisterDevice(
    @GetUser() user: any,
    @Query() unregisterDeviceDto: IDevice.UnregisterDeviceDto,
  ): Promise<IDevice.Response.DeviceResponseDto> {
    const { deviceToken } = unregisterDeviceDto
    const device = await this.notificationInPort.checkExistDevice(deviceToken)
    if (device == null) {
      throw new UserException(StatusCodes.NOT_FOUND, UserException.DEVICE_NOT_FOUND, getCurrentMethodName())
    }
    await this.notificationInPort.unregisterDevice(user.id, device.deviceToken)
    return device
  }

  @Get('/')
  public async getDevice(deviceToken: string): Promise<IDevice.Response.UserDeviceResponseDto | null> {
    const device = await this.notificationInPort.checkExistDevice(deviceToken)
    if (device == null) {
      throw new UserException(StatusCodes.NOT_FOUND, UserException.DEVICE_NOT_FOUND, getCurrentMethodName())
    }
    return device
  }

  @Get('/user')
  public async getUserDevice(@GetUser() user: any): Promise<IDevice.Response.UserDeviceResponseDto[] | null> {
    const devices = await this.notificationInPort.getDeviceToken(user.id)
    if (devices == null) {
      throw new UserException(StatusCodes.NOT_FOUND, UserException.DEVICE_NOT_FOUND, getCurrentMethodName())
    }
    return devices
  }

  @Patch('/')
  public async updateDevice(
    @GetUser() user: any,
    @Body() updateDeviceDto: IDevice.UpdateDeviceDto,
  ): Promise<IDevice.Response.UserDeviceResponseDto> {
    const {
      deviceToken, deviceOsVersion, appVersion, isActive,
    } = updateDeviceDto
    const device = await this.notificationInPort.checkExistDevice(deviceToken)
    if (device == null) {
      throw new UserException(StatusCodes.NOT_FOUND, UserException.DEVICE_NOT_FOUND, getCurrentMethodName())
    }

    if (isActive) {
      await this.notificationInPort.makeDeviceTokenActive(user.id, deviceToken)
    }
    else {
      await this.notificationInPort.makeDeviceTokenInactive(user.id, deviceToken)
    }
    return await this.notificationInPort.registerDevice(
      user.id,
      deviceToken,
      isActive,
      device.deviceType,
      deviceOsVersion,
      appVersion,
    )
  }
}
