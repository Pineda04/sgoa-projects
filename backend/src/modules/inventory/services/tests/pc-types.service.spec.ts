import { Test, TestingModule } from '@nestjs/testing';
import { PcTypesService } from '../pc-types.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('PcTypesService', () => {
  let service: PcTypesService;

  const mockPrismaService = {
    pcTypes: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PcTypesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PcTypesService>(PcTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
