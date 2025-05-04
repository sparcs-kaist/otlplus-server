import { Injectable } from '@nestjs/common'
import { UserDevice, UserDeviceCreate } from '@otl/server-nest/modules/device/domain/device'
import { DeviceRepository } from '@otl/server-nest/modules/device/domain/device.repository'

import { UserException } from '@otl/common/exception/user.exception'
import { getCurrentMethodName } from '@otl/common/utils'

import { mapUserDevice } from '@otl/prisma-client/common/mapper/notification'
import { EDevice } from '@otl/prisma-client/entities/EDevice'
import { PrismaService } from '@otl/prisma-client/prisma.service'

@Injectable()
export class DevicePrismaRepository implements DeviceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async delete(device: UserDevice): Promise<UserDevice> {
    const { userId, deviceToken } = device
    const target: EDevice.Basic = await this.prisma.session_userprofile_device.findUniqueOrThrow({
      where: {
        userprofile_id_token: {
          userprofile_id: userId,
          token: deviceToken,
        },
      },
    })
    if (target == null) {
      throw new UserException(404, UserException.DEVICE_NOT_FOUND, getCurrentMethodName())
    }
    else {
      await this.prisma.session_userprofile_device.delete({
        where: {
          id: target.id,
        },
      })
      return mapUserDevice(target)
    }
  }

  async deleteByToken(token: string): Promise<UserDevice[] | null> {
    const target: EDevice.Basic[] = await this.prisma.session_userprofile_device.findMany({
      where: {
        token,
      },
    })

    await this.prisma.session_userprofile_device.deleteMany({
      where: {
        token,
      },
    })
    return target.map((e) => mapUserDevice(e))
  }

  async deleteMany(devices: UserDevice[]): Promise<UserDevice[]> {
    const ids = devices.map((e) => e.id)
    const targets: EDevice.Basic[] = await this.prisma.session_userprofile_device.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    })
    await this.prisma.session_userprofile_device.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    })
    return targets.map((e) => mapUserDevice(e))
  }

  findByToken(token: string): Promise<UserDevice[] | null> {
    return this.prisma.session_userprofile_device
      .findMany({
        where: {
          token,
        },
      })
      .then((e) => {
        if (e == null) {
          return null
        }

        return e.map((device) => mapUserDevice(device))
      })
  }

  findByUserId(userId: number): Promise<UserDevice[] | null> {
    return this.prisma.session_userprofile_device
      .findMany({
        where: {
          userprofile_id: userId,
        },
      })
      .then((e) => {
        if (e == null) {
          return null
        }

        return e.map((device) => mapUserDevice(device))
      })
  }

  findByUserIdAndToken(userId: number, token: string): Promise<UserDevice | null> {
    return this.prisma.session_userprofile_device
      .findUnique({
        where: {
          userprofile_id_token: {
            userprofile_id: userId,
            token,
          },
        },
      })
      .then((e) => {
        if (e == null) {
          return null
        }

        return mapUserDevice(e)
      })
  }

  save(device: UserDevice): Promise<UserDevice>

  save(device: UserDeviceCreate): Promise<UserDevice>

  save(device: UserDeviceCreate | UserDevice): Promise<UserDevice> {
    if ('id' in device) {
      return this.prisma.session_userprofile_device
        .update({
          where: {
            id: device.id,
          },
          data: {
            userprofile_id: device.userId,
            token: device.deviceToken,
            is_active: device.isActive,
            deviceType: device.deviceType,
            deviceOsVersion: device.deviceOsVersion,
            appVersion: device.appVersion,
          },
        })
        .then((e) => {
          if (e == null) {
            throw new UserException(404, UserException.DEVICE_NOT_FOUND, getCurrentMethodName())
          }
          return mapUserDevice(e)
        })
    }
    return this.prisma.session_userprofile_device
      .create({
        data: {
          userprofile_id: device.userId,
          token: device.deviceToken,
          is_active: device.isActive,
          deviceType: device.deviceType,
          deviceOsVersion: device.deviceOsVersion,
          appVersion: device.appVersion,
        },
      })
      .then((e) => {
        if (e == null) {
          throw new UserException(404, UserException.DEVICE_NOT_FOUND, getCurrentMethodName())
        }
        return mapUserDevice(e)
      })
  }
}
