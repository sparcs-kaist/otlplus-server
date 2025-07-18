import { NotificationInPrivatePort } from '@otl/server-nest/modules/notification/domain/notification.in.private.port'
import { NotificationInPublicPort } from '@otl/server-nest/modules/notification/domain/notification.in.public.port'

export const NOTIFICATION_IN_PORT = Symbol('NotificationInPort')
export const NOTIFICATION_IN_PUBLIC_PORT = Symbol('NotificationInPublicPort')
export const NOTIFICATION_IN_PRIVATE_PORT = Symbol('NotificationInPrivatePort')
export interface NotificationInPort extends NotificationInPrivatePort, NotificationInPublicPort {}
