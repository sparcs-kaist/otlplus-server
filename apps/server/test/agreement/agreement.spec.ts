import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { AgreementPrivateService } from '@otl/server-nest/modules/agreement/agreement.private.service';
import { Test } from '@nestjs/testing';
import {
  AGREEMENT_REPOSITORY,
  AgreementRepository,
} from '@otl/server-nest/modules/agreement/domain/agreement.repository';
import {
  Agreement,
  AgreementType,
  UserAgreement,
  UserAgreementCreate,
} from '@otl/server-nest/modules/agreement/domain/UserAgreement';
import { OtlException } from '@otl/common/exception/otl.exception';
import { StatusCodes } from 'http-status-codes';
import { AgreementPrismaRepository } from '@otl/prisma-client/repositories/agreement.repository';
import { AGREEMENT_IN_PUBLIC_PORT } from '@otl/server-nest/modules/agreement/domain/agreement.in.port';

const moduleMocker = new ModuleMocker(global);

class MockAgreementRepository implements AgreementRepository {
  public readonly mockAgreement: Agreement[] = [];
  public readonly mockUser: { id: number; name: string }[] = [];
  public readonly mockUserAgreement: UserAgreement[] = [];

  constructor() {
    this.mockAgreement = Object.values(AgreementType).map((type, index) => ({
      id: index + 1,
      agreementType: type,
    }));
    this.mockUser = [
      {
        id: 1,
        name: 'John Doe',
      },
      {
        id: 2,
        name: 'Jane Doe',
      },
      {
        id: 3,
        name: 'Jim Doe',
      },
      {
        id: 4,
        name: 'Jack Doe',
      },
      {
        id: 5,
        name: 'Jill Doe',
      },
    ];
    this.mockUserAgreement = [];
  }
  getMockAgreement() {
    return this.mockAgreement;
  }
  getMockUser() {
    return this.mockUser;
  }
  getMockUserAgreement() {
    return this.mockUserAgreement;
  }
  delete(agreement: UserAgreement): Promise<UserAgreement> {
    throw new OtlException(StatusCodes.NOT_IMPLEMENTED, 'Not Implemented', 'delete');
  }

  deleteMany(agreement: UserAgreement[]): Promise<UserAgreement[]> {
    throw new OtlException(StatusCodes.NOT_IMPLEMENTED, 'Not Implemented', 'deleteMany');
  }

  async findById(id: number): Promise<UserAgreement | null> {
    const agreement = this.mockUserAgreement.find((agreement: any) => agreement.id === id);
    return Promise.resolve(agreement || null);
  }

  async findByUserId(userId: number): Promise<UserAgreement[] | null> {
    const userAgreement = this.mockUserAgreement.filter((agreement: any) => agreement.userId === userId);
    return Promise.resolve(userAgreement.length > 0 ? userAgreement : null);
  }

  async findByUserIdAndType(userId: number, type: AgreementType): Promise<UserAgreement | null> {
    const agreement = this.mockUserAgreement.find(
      (agreement) => agreement.userId === userId && agreement.agreementType === type,
    );
    return Promise.resolve(agreement || null);
  }

  async getAllAgreementTypes(): Promise<Agreement[]> {
    const agreementTypes = this.mockAgreement.map((agreement) => ({
      id: agreement.id,
      agreementType: agreement.agreementType,
    }));
    return Promise.resolve(agreementTypes);
  }

  async insert(agreement: UserAgreementCreate): Promise<UserAgreement> {
    const newAgreement = {
      ...agreement,
      id: this.mockUserAgreement.length + 1,
      agreementId: this.mockAgreement.find((a: any) => a.name === agreement.agreementType)!.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.mockUserAgreement.push(newAgreement);
    return await Promise.resolve(newAgreement);
  }

  async insertMany(agreement: UserAgreementCreate[]): Promise<UserAgreement[]> {
    const newAgreements = agreement.map((ag: any) => ({
      ...ag,
      id: this.mockUserAgreement.length + 1,
      agreementId: this.mockAgreement.find((a: any) => a.name === ag.agreementType)?.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    this.mockUserAgreement.push(...newAgreements);
    return Promise.resolve(newAgreements);
  }

  async updateMany(agreement: UserAgreement[]): Promise<UserAgreement[]> {
    const updatedAgreements: UserAgreement[] = [];
    agreement.forEach((ag) => {
      const index = this.mockUserAgreement.findIndex((a: any) => a.id === ag.id);
      if (index !== -1) {
        this.mockUserAgreement[index] = { ...this.mockUserAgreement[index], ...ag };
        updatedAgreements.push(this.mockUserAgreement[index]);
      }
    });
    return Promise.resolve(updatedAgreements);
  }

  async upsert(agreement: UserAgreementCreate): Promise<UserAgreement> {
    const existingAgreement = await this.findByUserIdAndType(agreement.userId, agreement.agreementType);
    if (existingAgreement !== null) {
      Object.assign(existingAgreement, agreement);
      return Promise.resolve(existingAgreement);
    } else {
      const newAgreement = {
        ...agreement,
        agreementId: this.mockAgreement.find((a: any) => a.name === agreement.agreementType)!.id,
        id: this.mockUserAgreement.length + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.mockUserAgreement.push(newAgreement);
      return Promise.resolve(newAgreement);
    }
  }

  async upsertMany(agreement: UserAgreementCreate[]): Promise<UserAgreement[]> {
    const newAgreements = Promise.all(
      agreement.map(async (ag) => {
        const existingAgreement = await this.findByUserIdAndType(ag.userId, ag.agreementType);
        if (existingAgreement) {
          Object.assign(existingAgreement, ag);
          return existingAgreement;
        } else {
          const newAgreement = {
            ...ag,
            agreementId: this.mockAgreement.find((a) => a.agreementType === ag.agreementType)!.id,
            id: this.mockUserAgreement.length + 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          this.mockUserAgreement.push(newAgreement);
          return newAgreement;
        }
      }),
    );
    return Promise.resolve(newAgreements);
  }

  update(agreement: UserAgreement): Promise<UserAgreement> {
    const index = this.mockUserAgreement.findIndex((a: any) => a.id === agreement.id);
    if (index !== -1) {
      this.mockUserAgreement[index] = { ...this.mockUserAgreement[index], ...agreement };
      return Promise.resolve(this.mockUserAgreement[index]);
    }
    throw new OtlException(StatusCodes.NOT_FOUND, 'Agreement not found', 'update');
  }
}

describe('AgreementService', () => {
  let service: AgreementPrivateService;
  let mockAgreementRepository: MockAgreementRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [AgreementPrivateService],
    })
      .useMocker((token) => {
        if (token === AgreementPrismaRepository || token === AGREEMENT_REPOSITORY) {
          const repo = new MockAgreementRepository();
          mockAgreementRepository = repo;
          return repo;
        }
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();
    service = moduleRef.get(AgreementPrivateService);
  });

  it('initialize', async () => {
    const userId = 1;
    const agreements = await service.initialize(userId);
    expect(agreements.length).toBe(mockAgreementRepository.getMockAgreement().length);

    agreements.forEach((agreement) => {
      expect(agreement.userId).toBe(userId);
      expect(agreement.agreementStatus).toBe(false);
      expect(agreement.modal).toBe(true);
    });
  });

  it('findByUserId', async () => {
    const userId = 1;
    const agreements = await service.initialize(userId);
    const retrievedAgreements = await service.findByUserId(userId);
    expect(retrievedAgreements).toBeDefined();
    expect(retrievedAgreements).not.toBeNull();
    expect(retrievedAgreements).toBeInstanceOf(Array);
    expect(retrievedAgreements!.length).toBe(mockAgreementRepository.getMockAgreement().length);

    const expectedAgreements = mockAgreementRepository
      .getMockUserAgreement()
      .filter((agreement) => agreement.userId === userId);

    retrievedAgreements?.forEach((agreement) => {
      const expectedAgreement = expectedAgreements.find((e) => e.id === agreement.id && e.userId === userId);
      expect(agreement).toBeDefined();
      expect(agreement.userId).toBe(expectedAgreement!.userId);
      expect(agreement.agreementStatus).toBe(expectedAgreement!.agreementStatus);
      expect(agreement.modal).toBe(expectedAgreement!.modal);
    });
  });

  it('findByUserIdAndType', async () => {
    //given
    const userId = 1;
    const agreements = await service.initialize(userId);
    const agreementTypes = await mockAgreementRepository.getAllAgreementTypes();

    //when
    for (const type of agreementTypes) {
      const retrievedAgreement = await service.findByUserIdAndType(userId, type.agreementType);
      expect(retrievedAgreement).toBeDefined();
      expect(retrievedAgreement).not.toBeNull();
      expect(retrievedAgreement).not.toBeInstanceOf(Array);

      // given
      let expectedAgreement = mockAgreementRepository
        .getMockUserAgreement()
        .filter((agreement) => agreement.userId === userId && agreement.agreementType === type.agreementType)[0];
      expect(retrievedAgreement).toBeDefined();
      expect(retrievedAgreement).not.toBeNull();
      expect(retrievedAgreement!.userId).toBe(expectedAgreement!.userId);
      expect(retrievedAgreement!.agreementStatus).toBe(expectedAgreement!.agreementStatus);
      expect(retrievedAgreement!.modal).toBe(expectedAgreement!.modal);
    }
  });

  it('allow', async () => {
    //given
    const userId = 1;
    const agreements = await service.initialize(userId);
    const agreementTypes = await mockAgreementRepository.getAllAgreementTypes();
    const agreementType = agreementTypes[0].agreementType;
    const agreement = await service.findByUserIdAndType(userId, agreementType);
    //when
    const retrievedAgreement = await service.allow(userId, agreementType);

    //then
    expect(retrievedAgreement).toBeDefined();
    expect(retrievedAgreement).not.toBeNull();
    expect(retrievedAgreement).not.toBeInstanceOf(Array);
    expect(retrievedAgreement!.userId).toBe(userId);
    expect(retrievedAgreement!.agreementStatus).toBe(true);
    expect(retrievedAgreement!.modal).toBe(agreement!.modal);
    expect(retrievedAgreement!.agreementType).toBe(agreementType);
  });

  it('disallow', async () => {
    //given
    const userId = 1;
    const agreements = await service.initialize(userId);
    const agreementTypes = await mockAgreementRepository.getAllAgreementTypes();
    const agreementType = agreementTypes[0].agreementType;
    const agreement = await service.findByUserIdAndType(userId, agreementType);
    //when
    const allowedAgreement = await service.allow(userId, agreementType);
    expect(allowedAgreement!.agreementStatus).toBe(true);
    const retrievedAgreement = await service.disallow(userId, agreementType);

    //then
    expect(retrievedAgreement).toBeDefined();
    expect(retrievedAgreement).not.toBeNull();
    expect(retrievedAgreement).not.toBeInstanceOf(Array);
    expect(retrievedAgreement!.userId).toBe(userId);
    expect(retrievedAgreement!.agreementStatus).toBe(false);
    expect(retrievedAgreement!.modal).toBe(agreement!.modal);
    expect(retrievedAgreement!.agreementType).toBe(agreementType);
    expect(allowedAgreement!.agreementStatus).toBe(false);
  });

  it('toggleModal', async () => {
    //given
    const userId = 1;
    const agreements = await service.initialize(userId);
    const agreementTypes = await mockAgreementRepository.getAllAgreementTypes();
    const agreementType = agreementTypes[0].agreementType;
    const agreement = await service.findByUserIdAndType(userId, agreementType);
    //when
    const retrievedAgreement = await service.toggleModal(agreement!.id, false);

    //then
    expect(retrievedAgreement).toBeDefined();
    expect(retrievedAgreement).not.toBeNull();
    expect(retrievedAgreement).not.toBeInstanceOf(Array);
    expect(retrievedAgreement!.userId).toBe(userId);
    expect(retrievedAgreement!.agreementStatus).toBe(agreement!.agreementStatus);
    expect(retrievedAgreement!.modal).toBe(false);
    expect(retrievedAgreement!.agreementType).toBe(agreementType);
  });
});
