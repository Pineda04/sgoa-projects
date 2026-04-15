import { Test, TestingModule } from '@nestjs/testing';
import { TeacherDepartmentPositionService } from '../teacher-department-position.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { DepartmentsService } from 'src/modules/centers/services/departments.service';
import { PositionsService } from 'src/modules/teachers-config/services/positions.service';
import { TeachersService } from '../teachers.service';
import { UsersService } from 'src/modules/users/services/users.service';
import { RolesService } from 'src/modules/users/services/roles.service';
import { MailService } from 'src/modules/mail/services/mail.service';
import { formatISO } from 'date-fns';
import { CreateTeacherDepartmentPositionDto } from '../../dto/create-teacher-department-position.dto';

const FAKE_ID = '153416d3-cdf6-422a-82df-c3ec14206bd1';

describe('TeacherDepartmentPositionService', () => {
  let service: TeacherDepartmentPositionService;

  const mockPrismaService = {
    teacherDepartmentPosition: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn().mockImplementation((args) =>
        Promise.resolve({
          id: Date.now().toString(),
          ...args.data,
        }),
      ),
    },
  };

  const mockTeachersService = {
    findOneByUserId: jest.fn().mockImplementation((userId: string) =>
      Promise.resolve({
        id: FAKE_ID,
        name: 'Mock Teacher',
        code: 'TCH-001',
        email: 'mock.teacher@example.com',
        shiftStart: '11:00',
        shiftEnd: '17:00',
        categoryId: 'c3d4e5f6-a1b2-7890-abcd-1234567890ab',
        contractTypeId: 'd4e5f6a1-b2c3-7890-abcd-1234567890ab',
        shiftId: 'e5f6a1b2-c3d4-7890-abcd-1234567890ab',
        userId,
        categoryName: 'Categoria X',
        contractTypeName: 'Contrato X',
        shiftName: 'Matutino',
        undergrads: [
          { id: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab', name: 'Undergrad A' },
        ],
        postgrads: [
          { id: 'b2c3d4e5-f6a1-7890-abcd-1234567890ab', name: 'Postgrad B' },
        ],
      }),
    ),
  };

  const mockPositionsService = {
    findOneByName: jest.fn().mockImplementation((name: string) =>
      Promise.resolve({
        id: Date.now().toString(),
        name,
      }),
    ),
  };

  const mockMailService = {
    sendTeacherInvite: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeacherDepartmentPositionService,
        { provide: TeachersService, useValue: mockTeachersService },
        { provide: PositionsService, useValue: mockPositionsService },
        DepartmentsService,
        UsersService,
        RolesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<TeacherDepartmentPositionService>(
      TeacherDepartmentPositionService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be created a new relation mtm teacher-department-position', async () => {
    const dto: CreateTeacherDepartmentPositionDto = {
      userId: '8f7ec0c7-0e19-48f6-98e7-99db8b4bd9e2',
      centerDepartmentId: 'fd53d980-b5f4-4f77-9088-363d7b2d4c25',
      positionId: '758e38c5-be0e-484f-9089-22f9931385cd',
      startDate: formatISO(new Date().toISOString()),
    };

    const res = await service.create(dto);

    expect(res).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        teacherId: FAKE_ID,
        centerDepartmentId: dto.centerDepartmentId,
        positionId: dto.positionId,
      }),
    );

    expect(res.startDate).toBeInstanceOf(Date);
  });
});
