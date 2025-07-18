import { UserBasic, UserRelationMap, UserWithRelations } from '@otl/server-nest/modules/user/domain/User'

import { mapDepartment } from '@otl/prisma-client/common/mapper/department'
import { EDepartment, EUser } from '@otl/prisma-client/entities'

const relationPrismaToDomainMap = {
  session_userprofile_majors: 'majors',
  session_userprofile_minors: 'minors',
  department: 'department',
  taken_lectures: 'lectures',
  // session_userprofile_device: 'classtimes',
  // taken_lectures: 'examtimes',
} as const
type RelationPrismaToDomainMap = typeof relationPrismaToDomainMap

type IncludedRelations<T extends EUser.Basic> = {
  [K in keyof T & keyof RelationPrismaToDomainMap]: NonNullable<T[K]> extends object
    ? RelationPrismaToDomainMap[K]
    : never
}[keyof T & keyof RelationPrismaToDomainMap]

const relationMappers = {
  session_userprofile_majors: (department: EDepartment.Basic) => mapDepartment(department),
  session_userprofile_minors: (department: EDepartment.Basic) => mapDepartment(department),
}

export function mapUser<T extends EUser.Basic>(user: T): UserWithRelations<IncludedRelations<T>> {
  const base: UserBasic = {
    studentId: user.student_id,
    firstName: user.first_name,
    lastName: user.last_name,
    lastLogin: user.last_login,
    kaistId: user.kaist_id,
    departmentId: user.department_id,
    dateJoined: user.date_joined,
    ...user,
  }
  const withRelations = { ...base } as Partial<UserRelationMap>

  Object.keys(relationMappers).forEach((key) => {
    if (key in user && user[key as keyof T]) {
      const domainKey = relationPrismaToDomainMap[key as keyof RelationPrismaToDomainMap]

      const mapper = relationMappers[key as keyof typeof relationMappers]

      const relationObject = user[key as keyof T];
      (withRelations as any)[domainKey] = mapper(relationObject as any)
    }
  })
  return withRelations as UserWithRelations<IncludedRelations<T>>
}
