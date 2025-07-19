import { MockFunctionMetadata, ModuleMocker } from 'jest-mock'
import { DEVICE_REPOSITORY, DeviceRepository } from '@otl/server-nest/modules/device/domain/device.repository'
import { UserDevice, UserDeviceCreate } from '@otl/server-nest/modules/device/domain/device'
import { UserException } from '@otl/common/exception/user.exception'
import { StatusCodes } from 'http-status-codes'
import { DevicePrivateService } from '@otl/server-nest/modules/device/device.private.service'
import { Test } from '@nestjs/testing'
import { AgreementPrivateService } from '@otl/server-nest/modules/agreement/agreement.private.service'
import { AgreementPrismaRepository } from '@otl/prisma-client/repositories/agreement.repository'
import { AGREEMENT_REPOSITORY } from '@otl/server-nest/modules/agreement/domain/agreement.repository'
import { MockAgreementRepository } from '../agreement/agreement.spec'
import { DevicePrismaRepository } from '@otl/prisma-client/repositories/device.repository'

const moduleMocker = new ModuleMocker(global)

export class MockDeviceRepository implements DeviceRepository {
  public readonly mockUser: { id: number; name: string; refreshToken: string }[] = []
  public readonly mockUserDevice: UserDevice[] = []

  constructor() {
    const jwtService = new JwtService({
      secret: 'password',
    })
    for (let i = 0; i < 10; i++) {
      this.mockUser.push({
        id: i,
        name: `user${i}`,
        refreshToken: jwtService.sign({ id: i }, { expiresIn: '30s' }),
      })
    }
    this.mockUserDevice = []
  }

  getMockUserDevice(): UserDevice[] {
    return this.mockUserDevice
  }

  delete(device: UserDevice): Promise<UserDevice> {
    const index = this.mockUserDevice.findIndex((d) => d.id === device.id && d.userId == device.userId)
    const target = this.mockUserDevice[index]
    if (index !== -1) {
      this.mockUserDevice.splice(index, 1)
      return Promise.resolve(device)
    }
    return Promise.resolve(target)
  }

  deleteByToken(token: string): Promise<UserDevice[] | null> {
    const targets = this.mockUserDevice.filter((d) => d.deviceToken === token)
    if (targets.length > 0) {
      targets.forEach((d) => {
        const index = this.mockUserDevice.findIndex((device) => device.id === d.id)
        if (index !== -1) {
          this.mockUserDevice.splice(index, 1)
        }
      })

      return Promise.resolve(targets)
    } else {
      return Promise.resolve(null)
    }
  }

  deleteMany(devices: UserDevice[]): Promise<UserDevice[]> {
    const ids = devices.map((e) => e.id)
    const targets = this.mockUserDevice.filter((d) => ids.includes(d.id))
    if (targets.length > 0) {
      targets.forEach((d) => {
        const index = this.mockUserDevice.findIndex((device) => device.id === d.id)
        if (index !== -1) {
          this.mockUserDevice.splice(index, 1)
        }
      })
      return Promise.resolve(targets)
    }
    throw new UserException(StatusCodes.NOT_FOUND, UserException.DEVICE_NOT_FOUND, 'deleteMany')
  }

  findByToken(token: string): Promise<UserDevice[] | null> {
    const targets = this.mockUserDevice.filter((d) => d.deviceToken === token)
    if (targets.length > 0) {
      return Promise.resolve(targets)
    }
    return Promise.resolve(null)
  }

  findByUserId(userId: number): Promise<UserDevice[] | null> {
    const targets = this.mockUserDevice.filter((d) => d.userId === userId)
    if (targets.length > 0) {
      return Promise.resolve(targets)
    }
    return Promise.resolve(null)
  }

  findByUserIdAndToken(userId: number, token: string): Promise<UserDevice | null> {
    const target = this.mockUserDevice.filter((d) => d.userId === userId && d.deviceToken === token)
    if (target.length > 1) {
      throw new UserException(StatusCodes.INTERNAL_SERVER_ERROR, UserException.DEVICE_DUPLICATE, 'findByUserIdAndToken')
    } else if (target.length === 1) {
      return Promise.resolve(target[0])
    }
    return Promise.resolve(null)
  }

  save(device: UserDeviceCreate): Promise<UserDevice> {
    const newDevice = {
      ...device,
      id: this.mockUserDevice.length + 1,
    }
    this.mockUserDevice.push(newDevice)
    return Promise.resolve(newDevice)
  }
}
import { v4 as uuidv4 } from 'uuid'
import { JwtService } from '@nestjs/jwt'
import settings from '@otl/server-nest/settings'

export async function mockGetToken(): Promise<string> {
  return uuidv4()
}

describe('DeviceService', () => {
  let service: DevicePrivateService
  let mockDeviceRepository: MockDeviceRepository

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [DevicePrivateService],
    })
      .useMocker((token) => {
        if (token === DevicePrismaRepository || token === DEVICE_REPOSITORY) {
          const repo = new MockDeviceRepository()
          mockDeviceRepository = repo
          return repo
        }
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>
          const Mock = moduleMocker.generateFromMetadata(mockMetadata)
          return new Mock()
        }
      })
      .compile()
    service = moduleRef.get(AgreementPrivateService)
  })

  it('register by one user', async () => {})

  it('unregister by one user', async () => {})

  it('user multi login with different device', async () => {})

  it('device1: user1 -> user2 without logout', async () => {})

  it('user1 device1 logout automatically', async () => {})

  it('user1 device1 logout manually', async () => {})

  it('user inactivate device1', async () => {})

  it('user activate device2', async () => {})

  it("get user's device list", async () => {})

  it('get device by token (when user1, user2 have different token)', async () => {})

  it('get device by token (when user1, user2 have same token)', async () => {})
})
