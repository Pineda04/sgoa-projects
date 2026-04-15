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
    courseClassrooms: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
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
});
