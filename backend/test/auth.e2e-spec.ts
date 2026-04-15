import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AuthModule } from 'src/modules/auth/auth.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { mockMailService } from 'src/modules/mail/services/tests/mail.service.spec';
import { MailService } from 'src/modules/mail/services/mail.service';
import { AuthSigninDto } from 'src/modules/auth/dto';
import * as cookieParser from 'cookie-parser';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from 'src/common/guards';

jest.mock('nanoid', () => ({}));
// jest.mock('argon2', () => ({}));
// jest.mock('@nestjs/jwt', () => ({
//   JwtModule: {
//     register: jest.fn(),
//   },
// }));

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;

  let accessToken = '';

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn().mockImplementation(({ where }) =>
        Promise.resolve({
          id: 'user-' + Date.now().toString(),
          email: where?.email,
          code: where?.code,
          hash: '$argon2id$v=19$m=65536,t=3,p=4$i21qA6m3VX12UDjj9woKjQ$2NKaCYzEtouV/wgRo/XQGVVSKrYSvvVo94UyDVA2FZE',
          // hash: 'hashed-password',
          userRoles: [],
          activeStatus: true,
        }),
      ),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn().mockImplementation((args) =>
        Promise.resolve({
          id: Date.now().toString(),
          ...args.data,
        }),
      ),
    },
  };

  const mockAuthService = {};

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        JwtModule.register({
          secret: 'testing-mock-' + crypto.randomUUID() + Date.now().toString(),
          signOptions: { expiresIn: '1h' },
        }),
      ],
      providers: [
        { provide: MailService, useValue: mockMailService },
        {
          provide: APP_GUARD,
          useClass: AtGuard,
        },
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('/v1/api');

    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.use(cookieParser('key'));

    await app.init();
  });

  it('/auth/local/signin (POST)', async () => {
    const dto: AuthSigninDto = {
      email: 'admin1@gmail.com',
      code: '12345',
      password: '12345',
    };

    const response = await request(app.getHttpServer())
      .post('/v1/api/auth/local/signin')
      .send(dto);

    expect(response.body).toEqual({
      access_token: expect.stringMatching(/^([\w]+\.(\w+\.)+[\w\-]+)$/),
    });

    // Cookie RefreshToken
    expect(response.headers['set-cookie']).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/(refresh_token)/),
        expect.stringMatching(/([\w-]+)\.([\w-]+)\.([\w-]+)/),
      ]),
    );

    if (response.ok) accessToken = response.body['access_token'];

    return response;
  });

  it('/auth/logout (POST) -> 401 Unauthorized, access_token not set', async () => {
    const response = await request(app.getHttpServer())
      .post('/v1/api/auth/logout')
      .expect(401);

    return response;
  });

  it('/auth/logout (POST) -> 200 Ok, access_token set', async () => {
    const response = await request(app.getHttpServer())
      .post('/v1/api/auth/logout')
      .auth(accessToken, {
        type: 'bearer',
      })
      .expect(200);

    return response;
  });

  it('/mail (GET) -> 200 Ok, access_token set', async () => {
    const response = await request(app.getHttpServer())
      .get('/v1/api/mail')
      .auth(accessToken, {
        type: 'bearer',
      })
      .expect(200);

    return response;
  });
});
