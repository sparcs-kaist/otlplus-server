import { _NotificationPort } from '@otl/common/notification/notification.port'

export const NOTIFICATION_IN_PORT = Symbol('NotificationInPort')
export interface NotificationInPort extends _NotificationPort {}
