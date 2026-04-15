import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentsService } from '../departments.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('DepartmentsService', () => {
  let service: DepartmentsService;

  const mockPrismaService = {
    departments: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DepartmentsService>(DepartmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
