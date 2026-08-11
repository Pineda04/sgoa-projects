import { Test, TestingModule } from '@nestjs/testing';
import { CourseClassroomsService } from '../course-classrooms.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CenterDepartmentsService } from 'src/modules/centers/services/center-departments.service';
import { PositionsService } from 'src/modules/teachers-config/services/positions.service';
import { TeacherDepartmentPositionService } from 'src/modules/teachers/services/teacher-department-position.service';
import { AcademicPeriodsService } from 'src/modules/teaching-assignment/services/academic-periods.service';
import { TeachersService } from 'src/modules/teachers/services/teachers.service';
import { DepartmentsService } from 'src/modules/centers/services/departments.service';
import { RolesService } from 'src/modules/users/services/roles.service';
import { UsersService } from 'src/modules/users/services/users.service';
import { MailService } from 'src/modules/mail/services/mail.service';
import { mockMailService } from 'src/modules/mail/services/tests/mail.service.spec';

describe('CourseClassroomsService', () => {
  let service: CourseClassroomsService;

  const mockPrismaService = {
    courseClassroom: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseClassroomsService,
        AcademicPeriodsService,
        TeachersService,
        TeacherDepartmentPositionService,
        PositionsService,
        CenterDepartmentsService,
        DepartmentsService,
        UsersService,
        RolesService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<CourseClassroomsService>(CourseClassroomsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('normalizes days and section when creating', async () => {
    mockPrismaService.courseClassroom.create.mockImplementation(({ data }) =>
      Promise.resolve(data),
    );

    await service.create({
      days: 'ViLu',
      section: '8:00-9:30',
    } as any);

    expect(mockPrismaService.courseClassroom.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        days: 'LuVi',
        section: '08:00 - 09:30',
      }),
    });
  });

  it('normalizes only provided schedule fields when updating', async () => {
    mockPrismaService.courseClassroom.update.mockImplementation(({ data }) =>
      Promise.resolve(data),
    );

    await service.update('course-classroom-id', { days: 'MiLu' } as any);

    expect(mockPrismaService.courseClassroom.update).toHaveBeenCalledWith({
      where: { id: 'course-classroom-id' },
      data: { days: 'LuMi' },
    });
  });

  it('rejects a single-hour legacy section without persisting it', async () => {
    await expect(
      service.create({ days: 'Lu', section: '08:00' } as any),
    ).rejects.toThrow('inicio y fin');
    expect(mockPrismaService.courseClassroom.create).not.toHaveBeenCalled();
  });
});
