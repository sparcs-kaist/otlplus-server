import { Module, OnModuleInit } from '@nestjs/common';
import { SyncRepository } from '@otl/scholar-sync/prisma/repositories/sync.repository';
import { PrismaService } from '@otl/scholar-sync/prisma/prisma.service';

@Module({
  providers: [PrismaService, SyncRepository],
  exports: [PrismaService, SyncRepository],
})
export class PrismaModule implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}
  onModuleInit() {}
}
