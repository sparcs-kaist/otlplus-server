import { UserDevice, UserDeviceCreate } from '@otl/server-nest/modules/device/domain/device'

export const DEVICE_REPOSITORY = Symbol('DEVICE_REPOSITORY')
export interface DeviceRepository {
  // get device by token
  findByToken(token: string): Promise<UserDevice[] | null>

  // get device by userId
  findByUserId(userId: number): Promise<UserDevice[] | null>

  // get device by userId and token
  findByUserIdAndToken(userId: number, token: string): Promise<UserDevice | null>

  // get active devices for multiple users (bulk query)
  findActiveDevicesByUserIds(userIds: number[]): Promise<UserDevice[]>

  // deactivate devices by tokens
  deactivateByTokens(tokens: string[]): Promise<number>

  // register device
  save(device: UserDevice): Promise<UserDevice>
  save(device: UserDeviceCreate): Promise<UserDevice>
  save(device: UserDeviceCreate | UserDevice): Promise<UserDevice>

  // unregister device
  delete(device: UserDevice): Promise<UserDevice>

  // unregister many devices
  deleteMany(devices: UserDevice[]): Promise<UserDevice[]>

  // unregister device by token
  deleteByToken(token: string): Promise<UserDevice[] | null>
}
