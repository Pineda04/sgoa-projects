import { Test, TestingModule } from '@nestjs/testing';
import { MonitorSizesService } from '../monitor-sizes.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('MonitorSizesService', () => {
  let service: MonitorSizesService;

  const mockPrismaService = {
    monitorSizes: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonitorSizesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<MonitorSizesService>(MonitorSizesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
