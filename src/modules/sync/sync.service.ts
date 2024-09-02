import { Injectable } from '@nestjs/common';
import { ISync } from 'src/common/interfaces/ISync';
import { SyncRepository } from 'src/prisma/repositories/sync.repository';

@Injectable()
export class SyncService {
  constructor(private readonly syncRepository: SyncRepository) {}

  async getDefaultSemester() {
    return await this.syncRepository.getDefaultSemester();
  }

  async syncScholarDB(data: ISync.ScholarDBData) {
    const existingLectures = await this.syncRepository.getExistingLectures({
      year: data.year,
      semester: data.semester,
    });
    const staffProfessor =
      await this.syncRepository.getOrCreateStaffProfessor();
  }
}
