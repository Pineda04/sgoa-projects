import { Test, TestingModule } from '@nestjs/testing';
import { PostgradsService } from '../postgrads.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('TeachersPostgradService', () => {
  let service: PostgradsService;

  const mockPrismaService = {
    postgrads: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostgradsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PostgradsService>(PostgradsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
