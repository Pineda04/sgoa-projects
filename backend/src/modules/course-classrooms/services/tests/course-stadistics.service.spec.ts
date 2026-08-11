import { Test, TestingModule } from '@nestjs/testing';
import { CourseStadisticsService } from '../course-stadistics.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CourseClassroomsService } from '../course-classrooms.service';

describe('CourseStadisticsService', () => {
  let service: CourseStadisticsService;

  const mockPrismaService = {
    courseStadistic: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockCourseClassroomsService = {
    findOne: jest.fn(),
  };

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
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('allows statistics updates when enrollment is unknown', async () => {
    mockCourseClassroomsService.findOne.mockResolvedValue({
      studentCount: null,
    });
    mockPrismaService.courseStadistic.update.mockResolvedValue({
      id: 'stat-1',
    });

    await expect(
      service.update('class-1', { ABD: 1, APB: 2, NSP: 3, RPB: 4 }),
    ).resolves.toEqual({ id: 'stat-1' });
  });

  it.each([null, 0])(
    'returns non-calculable percentages for enrollment %s',
    async (studentCount) => {
      mockPrismaService.courseStadistic.findMany.mockResolvedValue([
        {
          ABD: 1,
          APB: 2,
          NSP: 3,
          RPB: 4,
          courseClassroom: {
            studentCount,
            section: '08:00 - 10:00',
            course: {
              code: 'IS101',
              name: 'Programación',
              department: { name: 'Sistemas' },
            },
            modality: { name: 'Presencial' },
            teachingSession: {
              assignmentReport: {
                teacher: {
                  user: { code: 'T001', name: 'Docente' },
                },
                period: { pac: 1, year: 2026 },
              },
            },
          },
        },
      ]);
      mockPrismaService.courseStadistic.count.mockResolvedValue(1);

      const result = await service.generateConsolidated({}, {});

      expect(result.data[0]).toMatchObject({
        initial: studentCount,
        indexABD: null,
        indexNSP: null,
        indexRPB: null,
        indexAPB: null,
        terminalEfficiency: null,
      });
      expect(
        Object.values(result.data[0]).some(
          (value) => typeof value === 'number' && !Number.isFinite(value),
        ),
      ).toBe(false);
    },
  );
});
