import { ModuleRef } from '@nestjs/core';
import { Injectable } from '@nestjs/common';
import * as runtime from '@prisma/client/runtime/library';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from './prisma.service';

@Injectable()
export class TranManager {
  private static staticPrismaService: PrismaService;
  private static txClient: Omit<PrismaClient, runtime.ITXClientDenyList>;

  constructor(
    private readonly ref: ModuleRef,
    private readonly prismaService: PrismaService,
  ) {
    TranManager.staticPrismaService = prismaService;
  }

  public static async transaction(bizLogic: () => unknown) {
    const prisma = this.staticPrismaService;
    return await prisma.$transaction(async (tx) => {
      TranManager.saveTx(tx);
      return bizLogic();
    });
  }
  private static saveTx(tx: Omit<PrismaClient, runtime.ITXClientDenyList>) {
    this.txClient = tx;
  }

  public static getTx() {
    return TranManager.txClient ?? TranManager.staticPrismaService;
  }
}
