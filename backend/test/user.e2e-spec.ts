import { Test, TestingModule } from '@nestjs/testing';
import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  Injectable,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { UsersModule } from '../src/modules/users/users.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import { EUserRole } from 'src/common/enums';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { TJwtPayload } from 'src/modules/auth/types';
import { CentersService } from 'src/modules/centers/services/centers.service';
import { CenterDepartmentsService } from 'src/modules/centers/services/center-departments.service';
import { FacultiesService } from 'src/modules/centers/services/faculties.service';
import { IsValidCenterConfigConstraint } from 'src/modules/centers/validators';
import { useContainer } from 'class-validator';

@Injectable()
class MockAuthGuard implements CanActivate {
  private user: TJwtPayload = {
    sub: Date.now().toString(),
    email: 'fake.user@test.com',
    roles: [EUserRole.COORDINADOR_AREA],
  };

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();

    req.user = this.user;

    return true;
  }
}

describe('UserController (e2e)', () => {
  let app: INestApplication<App>;

  const TEST_CENTER_DEPARTMENT_ID = crypto.randomUUID();

  const mockUsers = [
    { id: '09d8245a-9257-4b57-b6e5-c68eb0412f16', name: 'TestMock' },
  ];

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue(mockUsers),
      update: jest.fn(),
      create: jest.fn().mockImplementation((args) =>
        Promise.resolve({
          id: Date.now().toString(),
          ...args.data,
        }),
      ),
    },
    role: {
      findUnique: jest.fn().mockImplementation(({ where }) =>
        Promise.resolve({
          id: 'role-' + Date.now().toString(),
          name: where?.name,
        }),
      ),
    },
    centerDepartment: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: TEST_CENTER_DEPARTMENT_ID,
          name: 'Test Department',
        },
      ]),
    },
    position: {
      findUnique: jest.fn().mockImplementation(({ where }) =>
        Promise.resolve({
          id: 'position-' + Date.now().toString(),
          name: where?.name ?? 'Ninguno',
        }),
      ),
    },
    teacherDepartmentPosition: {
      findFirst: jest.fn(),
    },
  };

  const mockCentersService = {
    findAll: jest.fn().mockResolvedValue([{ id: 'center-1' }]),
  };

  const mockCenterDepartmentService = {
    findAll: jest.fn().mockResolvedValue([{ id: 'dept-1' }]),
  };

  const mockFacultiesService = {
    findAll: jest.fn().mockResolvedValue([{ id: 'faculty-1' }]),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
      providers: [
        { provide: CentersService, useValue: mockCentersService },
        {
          provide: CenterDepartmentsService,
          useValue: mockCenterDepartmentService,
        },
        { provide: FacultiesService, useValue: mockFacultiesService },
        IsValidCenterConfigConstraint,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    // const validator = moduleFixture.get<IsValidCenterConfigConstraint>(
    //   IsValidCenterConfigConstraint,
    // );
    // jest
    //   .spyOn(validator, 'getCenterDepartmentsIds')
    //   .mockResolvedValue(['0f144603-5538-450f-b765-8549ffb212f1']);

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('/v1/api');

    app.useGlobalGuards(new MockAuthGuard());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    useContainer(app.select(UsersModule), { fallbackOnErrors: true });

    await app.init();
  });

  afterAll(async () => await app.close());

  it('/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/v1/api/users')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(mockUsers);
  });

  it('/users (POST)', async () => {
    const dto: CreateUserDto = {
      name: 'TestMock',
      code: '123455',
      email: 'test.mock@university.edu',
      password: 'TestPassword123',
      passwordConfirm: 'TestPassword123',
      roles: [EUserRole.DOCENTE],
      dummyFieldForTeacher: 'test',
      centerDepartmentId: TEST_CENTER_DEPARTMENT_ID,
    };

    const response = await request(app.getHttpServer())
      .post('/v1/api/users')
      .send(dto)
      .expect('Content-Type', /json/);

    console.log('Response body:', response.body);

    expect(response.statusCode).toEqual(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: dto.name,
        code: dto.code,
        email: dto.email,
        teacher: expect.any(Object),
      }),
    );
  });

  it('/users (POST) -> 403 Forbidden', async () => {
    const dto: CreateUserDto = {
      name: 'TestMock',
      code: '123455',
      email: 'test.mock@university.edu',
      password: 'TestPassword123',
      passwordConfirm: 'TestPassword123',
      roles: [EUserRole.ADMIN],
      dummyFieldForTeacher: 'test',
    };

    const response = await request(app.getHttpServer())
      .post('/v1/api/users')
      .send(dto)
      .expect('Content-Type', /json/)
      .expect(403, {
        statusCode: 403,
        error: 'Forbidden',
        message:
          'Coordinadores de área o docentes no pueden asignar roles de RRHH, ADMIN o DIRECCIÓN.',
      });

    return response;
  });
});
