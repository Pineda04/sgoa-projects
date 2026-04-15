import { Test, TestingModule } from '@nestjs/testing';
import { ActivityTypesService } from '../activity-types.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('ActivityTypesService', () => {
  let service: ActivityTypesService;

  const mockPrismaService = {
    activityTypes: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityTypesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ActivityTypesService>(ActivityTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
