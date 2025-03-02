import { Injectable } from '@nestjs/common';
import { NoticesRepository } from '@src/prisma/repositories/notices.repository';

@Injectable()
export class NoticesService {
  constructor(private readonly noticesRepository: NoticesRepository) {}

  public async getNotices() {
    return await this.noticesRepository.getNotices(new Date());
  }
}
