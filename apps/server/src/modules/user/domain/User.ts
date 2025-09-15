import { Department } from '@otl/server-nest/modules/departments/domain/department'
import { LectureBasic } from '@otl/server-nest/modules/lectures/domain/lecture'

export class User {
  id!: number

  studentId!: string

  uid!: string | null

  sid!: string

  lastLogin!: Date | null

  kaistId!: string | null

  status!: string | null

  language!: string | null

  departmentId!: number | null

  email!: string | null

  dateJoined!: Date

  firstName!: string

  lastName!: string
}

export type UserRelationMap = {
  department: Department
  majors: Department
  minors: Department[]
  lectures: LectureBasic[]
}

export type UserWithRelations<T extends keyof UserRelationMap = never> = User & Pick<UserRelationMap, T>

export type UserBasic = UserWithRelations

export type UserWithDepartment = UserWithRelations<'majors'>
