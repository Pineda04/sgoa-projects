import { Test, TestingModule } from '@nestjs/testing';
import { ShiftsService } from '../shifts.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('ShiftsService', () => {
  let service: ShiftsService;

  const mockPrismaService = {
    shifts: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShiftsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ShiftsService>(ShiftsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
