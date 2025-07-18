import { Module } from '@nestjs/common'
import { DeviceController } from '@otl/server-nest/modules/device/device.controller'
import { DevicePrivateService } from '@otl/server-nest/modules/device/device.private.service'
import { DevicePublicService } from '@otl/server-nest/modules/device/device.public.service'
import { DEVICE_IN_PORT, DEVICE_IN_PUBLIC_PORT } from '@otl/server-nest/modules/device/domain/device.in.port'
import { DEVICE_REPOSITORY } from '@otl/server-nest/modules/device/domain/device.repository'

import { PrismaModule } from '@otl/prisma-client'
import { DevicePrismaRepository } from '@otl/prisma-client/repositories/device.repository'

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: DEVICE_REPOSITORY,
      useClass: DevicePrismaRepository,
    },
    {
      provide: DEVICE_IN_PORT,
      useFactory: (agreementRepository) => new DevicePrivateService(agreementRepository),
      inject: [DEVICE_REPOSITORY],
    },
    {
      provide: DEVICE_IN_PUBLIC_PORT,
      useFactory: (agreementRepository) => new DevicePublicService(agreementRepository),
      inject: [DEVICE_REPOSITORY],
    },
  ],
  exports: [DEVICE_IN_PUBLIC_PORT],
  controllers: [DeviceController],
})
export class DeviceModule {}
