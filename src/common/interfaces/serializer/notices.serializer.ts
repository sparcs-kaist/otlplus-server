import { ENotice } from 'src/common/entites/ENotice';
import { INotice } from '../INotice';

export function toJsonNoticeBasic(notice: ENotice.Basic): INotice.Basic {
  return {
    title: notice.title,
    content: notice.content,
    start_time: notice.start_time,
    end_time: notice.end_time,
  };
}
