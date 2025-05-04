import { UserDevice } from '@otl/server-nest/modules/device/domain/device'

import { EUser } from '@otl/prisma-client/entities'
import { EDevice } from '@otl/prisma-client/entities/EDevice'

export function mapUserDevice(entity: EDevice.Basic): UserDevice {
  return {
    id: entity.id,
    userId: entity.userprofile_id,
    deviceToken: entity.token,
    isActive: entity.is_active,
    deviceType: entity.deviceType,
    deviceOsVersion: entity.deviceOsVersion,
    appVersion: entity.appVersion,
  }
}

export function mapUserToUserDevice(entity: EUser.WithDevice): UserDevice[] {
  return entity.session_userprofile_device.map((device) => ({
    id: device.id,
    userId: entity.id,
    deviceToken: device.token,
    isActive: device.is_active,
    deviceType: device.deviceType,
    deviceOsVersion: device.deviceOsVersion,
    appVersion: device.appVersion,
  }))
}
