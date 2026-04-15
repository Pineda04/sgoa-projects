import { Test, TestingModule } from '@nestjs/testing';
import { ConditionsService } from '../conditions.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('ConditionsService', () => {
  let service: ConditionsService;

  const mockPrismaService = {
    conditions: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConditionsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ConditionsService>(ConditionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
