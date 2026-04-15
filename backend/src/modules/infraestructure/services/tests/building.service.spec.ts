import { Test, TestingModule } from '@nestjs/testing';
import { BuildingService } from '../building.service';

import { PrismaService } from 'src/prisma/prisma.service';

describe('BuildingsService', () => {
  let service: BuildingService;

  const mockPrismaService = {
    building: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuildingService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<BuildingService>(BuildingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
