import { Test, TestingModule } from '@nestjs/testing';
import { AcademicAssignmentReportsService } from '../academic-assignment-reports.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CenterDepartmentsService } from 'src/modules/centers/services/center-departments.service';
import { CentersService } from 'src/modules/centers/services/centers.service';
import { CourseClassroomsService } from 'src/modules/course-classrooms/services/course-classrooms.service';
import { CoursesService } from 'src/modules/course-classrooms/services/courses.service';
import { ModalitiesService } from 'src/modules/course-classrooms/services/modalities.service';
import { ClassroomService } from 'src/modules/infraestructure/services/classroom.service';
import { PositionsService } from 'src/modules/teachers-config/services/positions.service';
import { TeacherDepartmentPositionService } from 'src/modules/teachers/services/teacher-department-position.service';
import { TeachersService } from 'src/modules/teachers/services/teachers.service';
import { AcademicPeriodsService } from '../academic-periods.service';
import { TeachingSessionsService } from '../teaching-sessions.service';
import { MailService } from 'src/modules/mail/services/mail.service';
import { mockMailService } from 'src/modules/mail/services/tests/mail.service.spec';
import { RolesService } from 'src/modules/users/services/roles.service';
import { UsersService } from 'src/modules/users/services/users.service';
import { DepartmentsService } from 'src/modules/centers/services/departments.service';

describe('AcademicAssignmentReportsService', () => {
  let service: AcademicAssignmentReportsService;

  const mockPrismaService = {
    academicAssignmentReports: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    courseClassroom: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AcademicAssignmentReportsService,
        AcademicPeriodsService,
        TeachersService,
        TeacherDepartmentPositionService,
        PositionsService,
        CentersService,
        CoursesService,
        ModalitiesService,
        ClassroomService,
        TeachingSessionsService,
        CourseClassroomsService,
        CenterDepartmentsService,
        UsersService,
        RolesService,
        DepartmentsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<AcademicAssignmentReportsService>(
      AcademicAssignmentReportsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it.each([null, 0, 25])('accepts studentCount %s', (studentCount) => {
    expect((service as any).validateStudentCount(studentCount)).toBeUndefined();
  });

  it.each([-1, 1.5, '12 estudiantes', ''])(
    'rejects invalid studentCount %s',
    (studentCount) => {
      expect((service as any).validateStudentCount(studentCount)).toContain(
        "El valor de 'studentCount'",
      );
    },
  );

  it('normalizes imported schedules before persistence', async () => {
    jest.spyOn(service, 'findAll').mockResolvedValue([
      {
        id: 'report-id',
        teacherId: 'teacher-id',
        centerDepartmentId: 'department-id',
        periodId: 'period-id',
        teachingSession: { id: 'session-id' },
      },
    ] as any);
    mockPrismaService.courseClassroom.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: 'class-id', ...data }),
    );

    await service.createFromArray({
      teacher: {
        teacherId: 'teacher-id',
        userId: 'user-id',
        centerDepartmentId: 'department-id',
        periodId: 'period-id',
        courses: [{ days: 'ViLu', section: '8:00-9:30' }],
      },
    } as any);

    expect(mockPrismaService.courseClassroom.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        days: 'LuVi',
        section: '08:00 - 09:30',
      }),
    });
  });

  it('rejects invalid imported sections before reading or persisting reports', async () => {
    const findAllSpy = jest.spyOn(service, 'findAll');

    await expect(
      service.createFromArray({
        teacher: {
          courses: [{ days: 'Lu', section: '08:00' }],
        },
      } as any),
    ).rejects.toThrow('inicio y fin');

    expect(findAllSpy).not.toHaveBeenCalled();
    expect(mockPrismaService.courseClassroom.create).not.toHaveBeenCalled();
  });

  it('detects imported teacher conflicts by interval overlap', () => {
    const existing = {
      days: 'LuMi',
      section: '08:00 - 10:30',
      course: { code: 'COURSE-1' },
    };

    const [result, error] = (
      service as any
    ).validateIfExistingAnotherCourseClassroom(
      new Map([['TEACHER-1', [existing]]]),
      'TEACHER-1',
      {
        teacherCode: 'TEACHER-1',
        teacherName: 'Teacher',
        days: 'Mi',
        section: '10:00 - 11:00',
      },
      'Period',
    );

    expect(result).toBeNull();
    expect(error).toContain('traslape');
  });

  it('fails conservatively for legacy teacher schedules', () => {
    const existing = {
      days: 'Lu',
      section: '08:00',
      course: { code: 'COURSE-1' },
    };

    const [result, error] = (
      service as any
    ).validateIfExistingAnotherCourseClassroom(
      new Map([['TEACHER-1', [existing]]]),
      'TEACHER-1',
      {
        teacherCode: 'TEACHER-1',
        teacherName: 'Teacher',
        days: 'Lu',
        section: '08:00 - 09:00',
      },
      'Period',
    );

    expect(result).toBeNull();
    expect(error).toContain('horario legado sin rango explícito');
  });

  it('uses equivalent normalized days in existing-record identity keys', () => {
    const unorderedKey = (service as any).courseClassroomIdentityKey(
      'TEACHER-1',
      'COURSE-1',
      'ViLu',
    );
    const orderedKey = (service as any).courseClassroomIdentityKey(
      'TEACHER-1',
      'COURSE-1',
      'LuVi',
    );

    expect(unorderedKey).toBe(orderedKey);
  });

  it('detects same-teacher overlap within a batch across classrooms', () => {
    const existing = {
      days: 'LuMi',
      section: '08:00 - 10:00',
      classroomName: 'Aula A',
    };
    const incoming = {
      days: 'Mi',
      section: '09:30 - 11:00',
      classroomName: 'Aula B',
    };

    expect(
      (service as any).findBatchScheduleConflict([existing], incoming),
    ).toBe(existing);
  });

  it('blocks an existing classroom reservation with invalid days', () => {
    const existing = {
      days: 'INVALID',
      section: '08:00 - 09:00',
      classroomName: 'Aula A',
      courseName: 'Legacy course',
    };
    const incoming = {
      days: 'Lu',
      section: '10:00 - 11:00',
      classroomName: 'Aula A',
    };

    expect(
      (service as any).findBatchScheduleConflict([existing], incoming),
    ).toBe(existing);
  });
});
