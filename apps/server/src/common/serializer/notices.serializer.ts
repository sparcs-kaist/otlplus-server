import { ENotice } from '@otl/api-interface/src/entities/ENotice';
import { INotice } from '@otl/api-interface/src/interfaces/INotice';

export function toJsonNoticeBasic(notice: ENotice.Basic): INotice.Basic {
  return {
    title: notice.title,
    content: notice.content,
    start_time: notice.start_time,
    end_time: notice.end_time,
  };
}
