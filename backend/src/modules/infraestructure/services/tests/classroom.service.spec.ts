import { Test, TestingModule } from '@nestjs/testing';
import { ClassroomService } from '../classroom.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('ClassroomService', () => {
  let service: ClassroomService;

  const mockPrismaService = {
    classroom: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    courseClassroom: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassroomService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ClassroomService>(ClassroomService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('uses real overlap for variable duration', async () => {
    mockPrismaService.classroom.findUnique.mockResolvedValue({
      id: 'classroom-id',
    });
    mockPrismaService.courseClassroom.findMany.mockResolvedValue([
      {
        courseId: 'course-id',
        days: 'Lu',
        section: '07:30 - 09:15',
        course: { name: 'Course' },
        teachingSession: {
          assignmentReport: {
            teacherId: 'teacher-id',
            teacher: { user: { name: 'Teacher' } },
          },
        },
      },
    ]);

    const result = await service.getAvailability(
      'classroom-id',
      '123e4567-e89b-12d3-a456-426614174000',
      'Lu',
    );

    expect(result.schedule.MONDAY?.occupied).toEqual([
      expect.objectContaining({ startTime: '07:30', endTime: '09:15' }),
    ]);
    expect(result.schedule.MONDAY?.available).not.toEqual(
      expect.arrayContaining([
        { startTime: '07:00', endTime: '08:00' },
        { startTime: '08:00', endTime: '09:00' },
        { startTime: '09:00', endTime: '10:00' },
      ]),
    );
    expect(result.schedule.MONDAY?.available).toContainEqual({
      startTime: '10:00',
      endTime: '11:00',
    });
  });

  it('infers a one-hour range for a legacy 24h start time', async () => {
    mockPrismaService.classroom.findUnique.mockResolvedValue({
      id: 'classroom-id',
    });
    mockPrismaService.courseClassroom.findMany.mockResolvedValue([
      {
        courseId: 'legacy-course-id',
        days: 'Lu',
        section: '10:00',
        course: { name: 'Legacy' },
        teachingSession: {
          assignmentReport: {
            teacherId: 'teacher-id',
            teacher: { user: { name: 'Teacher' } },
          },
        },
      },
    ]);

    const result = await service.getAvailability(
      'classroom-id',
      '123e4567-e89b-12d3-a456-426614174000',
      'Lu',
    );

    expect(result.schedule.MONDAY?.occupied).toEqual([
      expect.objectContaining({ startTime: '10:00', endTime: '11:00' }),
    ]);
    expect(result.schedule.MONDAY?.available).not.toContainEqual({
      startTime: '10:00',
      endTime: '11:00',
    });
    expect(result.schedule.MONDAY?.available).toContainEqual({
      startTime: '11:00',
      endTime: '12:00',
    });
  });

  it('infers a one-hour range for a legacy 12h start time', async () => {
    mockPrismaService.classroom.findUnique.mockResolvedValue({
      id: 'classroom-id',
    });
    mockPrismaService.courseClassroom.findMany.mockResolvedValue([
      {
        courseId: 'legacy-course-id',
        days: 'Vi',
        section: '4:00 PM',
        course: { name: 'Legacy' },
        teachingSession: {
          assignmentReport: {
            teacherId: 'teacher-id',
            teacher: { user: { name: 'Teacher' } },
          },
        },
      },
    ]);

    const result = await service.getAvailability(
      'classroom-id',
      '123e4567-e89b-12d3-a456-426614174000',
      'Vi',
    );

    expect(result.schedule.FRIDAY?.occupied).toEqual([
      expect.objectContaining({ startTime: '16:00', endTime: '17:00' }),
    ]);
  });

  it('fails conservatively when an applicable legacy schedule has no readable time', async () => {
    mockPrismaService.classroom.findUnique.mockResolvedValue({
      id: 'classroom-id',
    });
    mockPrismaService.courseClassroom.findMany.mockResolvedValue([
      {
        courseId: 'legacy-course-id',
        days: 'Lu',
        section: 'SEC-01',
        course: { name: 'Legacy' },
        teachingSession: {
          assignmentReport: {
            teacherId: 'teacher-id',
            teacher: { user: { name: 'Teacher' } },
          },
        },
      },
    ]);

    await expect(
      service.getAvailability(
        'classroom-id',
        '123e4567-e89b-12d3-a456-426614174000',
        'Lu',
      ),
    ).rejects.toThrow('horario legado sin rango explícito');
  });
});
