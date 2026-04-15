import { Test, TestingModule } from '@nestjs/testing';
import { BrandsService } from '../brands.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('BrandsService', () => {
  let service: BrandsService;

  const mockPrismaService = {
    brands: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrandsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<BrandsService>(BrandsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
