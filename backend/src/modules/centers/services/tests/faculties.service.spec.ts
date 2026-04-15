import { Test, TestingModule } from '@nestjs/testing';
import { FacultiesService } from '../faculties.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('FacultiesService', () => {
  let service: FacultiesService;

  const mockPrismaService = {
    faculties: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacultiesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<FacultiesService>(FacultiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
