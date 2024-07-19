import { ESemester } from 'src/common/entities/ESemester';

export type SemesterResponseDto = Omit<ESemester.Basic, 'id'>;
