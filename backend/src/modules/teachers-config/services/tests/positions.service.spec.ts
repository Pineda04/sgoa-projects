import { Test, TestingModule } from '@nestjs/testing';
import { PositionsService } from '../positions.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('PositionsService', () => {
  let service: PositionsService;

  const mockPrismaService = {
    positions: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PositionsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PositionsService>(PositionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
