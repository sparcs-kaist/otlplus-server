import { Injectable } from '@nestjs/common';
import { EDepartment } from '@otl/api-interface/src/entities/EDepartment';
import { DepartmentRepository } from '@src/prisma/repositories/department.repository';

const UNDERGRADUATE_DEPARTMENTS = [
  'CE',
  'MSB',
  'ME',
  'PH',
  'BiS',
  'IE',
  'ID',
  'BS',
  'CBE',
  'MAS',
  'MS',
  'NQE',
  'HSS',
  'EE',
  'CS',
  'AE',
  'CH',
  'TS',
];

const EXCLUDED_DEPARTMENTS = [
  'AA',
  'KSA',
  'URP',
  'ED',
  'INT',
  'KJ',
  'CWENA',
  'C',
  'E',
  'S',
  'PSY',
  'SK',
  'BIO',
  'CLT',
  'PHYS',
];

@Injectable()
export class DepartmentsService {
  constructor(private readonly departmentRepository: DepartmentRepository) {}
  async getDepartmentOptions() {
    const yearThreshold = new Date().getFullYear() - 2;
    const [departments, recentDepartmentCodes] = await Promise.all([
      this.departmentRepository.getAllDepartmentOptions(EXCLUDED_DEPARTMENTS),
      this.departmentRepository.getDepartmentCodesOfRecentLectures(yearThreshold),
    ]);

    if (recentDepartmentCodes.length === 0)
      console.error('recentDepartmentCodes is empty, which indicates something is wrong');

    const result = {
      undergraduate: [] as EDepartment.Basic[],
      recent: [] as EDepartment.Basic[],
      other: [] as EDepartment.Basic[],
    };

    departments.forEach((department) => {
      if (UNDERGRADUATE_DEPARTMENTS.includes(department.code)) {
        result.undergraduate.push(department);
      } else if (recentDepartmentCodes.includes(department.code)) {
        result.recent.push(department);
      } else {
        result.other.push(department);
      }
    });

    return result;
  }
}
