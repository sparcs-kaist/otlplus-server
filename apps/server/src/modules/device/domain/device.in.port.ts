import { DeviceInPrivatePort } from '@otl/server-nest/modules/device/domain/device.in.private.port'
import { DeviceInPublicPort } from '@otl/server-nest/modules/device/domain/device.in.public.port'

export const DEVICE_IN_PORT = Symbol('DeviceInPort')
export const DEVICE_IN_PRIVATE_PORT = Symbol('DeviceInPrivatePort')
export const DEVICE_IN_PUBLIC_PORT = Symbol('DeviceInPublicPort')
export interface DeviceInPort extends DeviceInPrivatePort, DeviceInPublicPort {}
