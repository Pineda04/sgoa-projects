import { Test, TestingModule } from '@nestjs/testing';
import { ContractTypesService } from '../contract-types.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('ContractTypesService', () => {
  let service: ContractTypesService;

  const mockPrismaService = {
    contractTypes: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractTypesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ContractTypesService>(ContractTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
