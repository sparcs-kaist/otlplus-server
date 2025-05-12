import { Injectable } from '@nestjs/common'

import { PrismaService } from '@otl/prisma-client/prisma.service'

@Injectable()
export class AppService {
  constructor(private readonly prismaService: PrismaService) {}

  public async prismaTest() {}

  getHello(): string {
    return 'Hello World!'
  }
}
