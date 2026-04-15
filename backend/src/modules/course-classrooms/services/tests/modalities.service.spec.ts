import { Test, TestingModule } from '@nestjs/testing';
import { ModalitiesService } from '../modalities.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('ModalitiesService', () => {
  let service: ModalitiesService;

  const mockPrismaService = {
    modalities: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModalitiesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ModalitiesService>(ModalitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
