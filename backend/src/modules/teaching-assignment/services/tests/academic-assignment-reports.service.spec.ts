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
  };

  beforeEach(async () => {
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
});
