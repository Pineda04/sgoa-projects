import { Test, TestingModule } from '@nestjs/testing';
import { MultimediaTypesService } from '../multimedia-types.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('MultimediaTypesService', () => {
  let service: MultimediaTypesService;

  const mockPrismaService = {
    multimediaTypes: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MultimediaTypesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<MultimediaTypesService>(MultimediaTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
