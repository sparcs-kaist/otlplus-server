import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service';

@Injectable()
export class PersonalsRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async createPersonal() {}
}
