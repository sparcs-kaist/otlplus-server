import { Injectable } from '@nestjs/common';
import { NoticesRepository } from '@otl/prisma-client/repositories';

@Injectable()
export class NoticesService {
  constructor(private readonly noticesRepository: NoticesRepository) {}

  public async getNotices() {
    return await this.noticesRepository.getNotices(new Date());
  }
}
