import { INotice } from '@otl/server-nest/common/interfaces'

import { ENotice } from '@otl/prisma-client/entities'

export function toJsonNoticeBasic(notice: ENotice.Basic): INotice.Basic {
  return {
    title: notice.title,
    content: notice.content,
    start_time: notice.start_time,
    end_time: notice.end_time,
  }
}
