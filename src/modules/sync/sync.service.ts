import { Injectable } from '@nestjs/common';
import { ISync } from 'src/common/interfaces/ISync';

@Injectable()
export class SyncService {
  async syncScholarDB(data: ISync.ScholarDBData) {}
}
