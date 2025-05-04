import { UserDevice, UserDeviceCreate } from '@otl/server-nest/modules/device/domain/device'

export const NOTIFICATION_REPOSITORY = Symbol('NOTIFICATION_REPOSITORY')
export const DEVICE_REPOSITORY = Symbol('DEVICE_REPOSITORY')
export interface DeviceRepository {
  // get device by token
  findByToken(token: string): Promise<UserDevice[] | null>

  // get device by userId
  findByUserId(userId: number): Promise<UserDevice[] | null>

  // get device by userId and token
  findByUserIdAndToken(userId: number, token: string): Promise<UserDevice | null>

  // register device
  save(device: UserDeviceCreate): Promise<UserDevice>

  // unregister device
  delete(device: UserDevice): Promise<UserDevice>

  // unregister many devices
  deleteMany(devices: UserDevice[]): Promise<UserDevice[]>

  // unregister device by token
  deleteByToken(token: string): Promise<UserDevice[] | null>
}
