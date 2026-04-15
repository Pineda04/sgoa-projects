import { Test, TestingModule } from '@nestjs/testing';
import { AcademicPeriodsService } from '../academic-periods.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('AcademicPeriodsService', () => {
  let service: AcademicPeriodsService;

  const mockPrismaService = {
    academicPeriods: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AcademicPeriodsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AcademicPeriodsService>(AcademicPeriodsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
