import { Test, TestingModule } from '@nestjs/testing';
import { TeachersService } from '../teachers.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/modules/mail/services/mail.service';
import { UsersService } from 'src/modules/users/services/users.service';
import { RolesService } from 'src/modules/users/services/roles.service';
import { PositionsService } from 'src/modules/teachers-config/services/positions.service';
import { CreateTeacherDto } from '../../dto/create-teacher.dto';

describe('TeachersService', () => {
  let service: TeachersService;

  const mockPrismaService = {
    teacher: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn().mockImplementation((args) =>
        Promise.resolve({
          id: Date.now().toString(),
          ...args.data,
        }),
      ),
    },
  };

  // const mockUsersService = {};

  // const mockMailerService = {
  //   sendMail: jest.fn().mockResolvedValue({}),
  // };

  const mockMailService = {
    sendTeacherInvite: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeachersService,
        UsersService,
        RolesService,
        PositionsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<TeachersService>(TeachersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be created a new teacher', async () => {
    const dto: CreateTeacherDto = {
      undergradId: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
      postgradId: 'b2c3d4e5-f6a1-7890-abcd-1234567890ab',
      categoryId: 'c3d4e5f6-a1b2-7890-abcd-1234567890ab',
      contractTypeId: 'd4e5f6a1-b2c3-7890-abcd-1234567890ab',
      shiftId: 'e5f6a1b2-c3d4-7890-abcd-1234567890ab',
      userId: 'f6a1b2c3-d4e5-7890-abcd-1234567890ab',
      centerDepartmentId: '65039ef6-1fc5-474c-b4e3-27239c200138',
      positionId: 'g7h8i9j0-k1l2-7890-abcd-1234567890ab',
      shiftStart: '11:00',
      shiftEnd: '17:00',
    };

    const res = await service.create(dto);

    expect(res).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        userId: dto.userId,
        categoryId: dto.categoryId,
        contractTypeId: dto.contractTypeId,
        shiftId: dto.shiftId,
      }),
    );

    expect(res.shiftStart).toBeDefined();
    expect(res.shiftEnd).toBeDefined();
  });
});
