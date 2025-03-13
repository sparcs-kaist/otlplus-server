import { EUser } from '@otl/api-interface/src/entities';
import { IUser } from '@otl/api-interface/src/interfaces';

export const toJsonUser = (user: EUser.Basic): IUser.Basic => {
  return {
    id: user.id,
    user_id: user.user_id,
    student_id: user.student_id,
    sid: user.sid,
    language: user.language,
    portal_check: user.portal_check,
    department_id: user.department_id,
    email: user.email,
    date_joined: user.date_joined,
    first_name: user.first_name,
    last_name: user.last_name,
    refresh_token: user.refresh_token,
    name_kor: user.name_kor ?? user.first_name + ' ' + user.last_name,
    name_eng: user.name_eng ?? user.first_name + ' ' + user.last_name,
  };
};
