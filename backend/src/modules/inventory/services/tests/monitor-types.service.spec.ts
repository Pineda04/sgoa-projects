import { Test, TestingModule } from '@nestjs/testing';
import { MonitorTypesService } from '../monitor-types.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('MonitorTypesService', () => {
  let service: MonitorTypesService;

  const mockPrismaService = {
    monitorTypes: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonitorTypesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<MonitorTypesService>(MonitorTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
