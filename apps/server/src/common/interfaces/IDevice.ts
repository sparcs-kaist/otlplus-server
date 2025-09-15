import { DeviceType } from '@otl/server-nest/modules/device/domain/device'
import { IsIn, IsNotEmpty, IsOptional } from 'class-validator'

export namespace IDevice {
  export class RegisterDeviceDto {
    @IsNotEmpty()
    deviceToken!: string

    @IsIn(Object.values(DeviceType))
    @IsOptional()
    deviceType?: string

    @IsOptional()
    deviceOsVersion?: string

    @IsOptional()
    appVersion?: string

    @IsNotEmpty()
    isActive!: boolean
  }

  export class UnregisterDeviceDto {
    @IsNotEmpty()
    deviceToken!: string
  }

  export class DeviceActivateDto {
    @IsNotEmpty()
    deviceToken!: string

    @IsNotEmpty()
    isActive!: boolean
  }

  export class UpdateDeviceDto extends DeviceActivateDto {
    @IsOptional()
    deviceOsVersion?: string

    @IsOptional()
    appVersion?: string
  }

  export namespace Response {
    export interface DeviceResponseDto {
      deviceToken: string

      deviceType?: string | null

      deviceOsVersion?: string | null

      appVersion?: string | null

      isActive?: boolean | null
    }

    export interface UserDeviceResponseDto extends DeviceResponseDto {
      userId: number
    }
  }
}
