import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from '../courses.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('CoursesService', () => {
  let service: CoursesService;

  const mockPrismaService = {
    courses: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
