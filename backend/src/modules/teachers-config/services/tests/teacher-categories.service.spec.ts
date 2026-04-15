import { Test, TestingModule } from '@nestjs/testing';
import { TeacherCategoriesService } from '../teacher-categories.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('TeacherCategoriesService', () => {
  let service: TeacherCategoriesService;

  const mockPrismaService = {
    teacherCategories: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeacherCategoriesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TeacherCategoriesService>(TeacherCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
