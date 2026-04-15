import { Test, TestingModule } from '@nestjs/testing';
import { TeachersPostgradService } from '../teachers-postgrad.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/modules/mail/services/mail.service';
import { mockMailService } from 'src/modules/mail/services/tests/mail.service.spec';
import { PositionsService } from 'src/modules/teachers-config/services/positions.service';
import { TeachersService } from 'src/modules/teachers/services/teachers.service';
import { RolesService } from 'src/modules/users/services/roles.service';
import { UsersService } from 'src/modules/users/services/users.service';

describe('TeachersPostgradService', () => {
  let service: TeachersPostgradService;

  const mockPrismaService = {
    teachersPostgrad: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeachersPostgradService,
        TeachersService,
        PositionsService,
        UsersService,
        RolesService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<TeachersPostgradService>(TeachersPostgradService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
