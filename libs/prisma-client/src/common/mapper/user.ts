import { UserBasic } from '@otl/server-nest/modules/user/domain/User'

import { EUser } from '@otl/prisma-client/entities'

export function mapUser(user: EUser.Basic): UserBasic {
  return {
    studentId: user.student_id,
    firstName: user.first_name,
    lastName: user.last_name,
    lastLogin: user.last_login,
    kaistId: user.kaist_id,
    departmentId: user.department_id,
    dateJoined: user.date_joined,
    ...user,
  }
}
