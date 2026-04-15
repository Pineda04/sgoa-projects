import { Test, TestingModule } from '@nestjs/testing';
import { CourseStadisticsService } from '../course-stadistics.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CourseClassroomsService } from '../course-classrooms.service';

describe('CourseStadisticsService', () => {
  let service: CourseStadisticsService;

  const mockPrismaService = {
    courseStadistics: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockCourseClassroomsService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseStadisticsService,
        { provide: PrismaService, useValue: mockPrismaService },
        {
          provide: CourseClassroomsService,
          useValue: mockCourseClassroomsService,
        },
      ],
    }).compile();

    service = module.get<CourseStadisticsService>(CourseStadisticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
