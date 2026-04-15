import { Test, TestingModule } from '@nestjs/testing';
import { CentersService } from '../centers.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('CentersService', () => {
  let service: CentersService;

  const mockPrismaService = {
    centers: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CentersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CentersService>(CentersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
