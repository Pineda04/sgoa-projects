import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { envs } from './config';

async function bootstrap() {
  const logger = new Logger('Main');

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('/api/v1');

  // app.useGlobalPipes(new ValidateGlobalIdsPipe()); // Para no validar uno por uno, los ValidateIdPipe pueden no ser utiles con esto activo.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // const { httpAdapter } = app.get(HttpAdapterHost);
  // app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  // const reflector = new Reflector();
  // app.useGlobalInterceptors(new TransformInterceptor());

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const config = new DocumentBuilder()
    .setTitle('Sistema de Planificación Integral (SPI)')
    .setDescription('Proyecto TE&A')
    .setVersion('1.0')
    .addTag('spi')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Ingrese el access-token',
        name: 'JWT',
        in: 'header',
      },
      'jwt',
    )
    .addSecurityRequirements('jwt')
    // .addBearerAuth(
    //   {
    //     type: 'http',
    //     scheme: 'bearer',
    //     bearerFormat: 'JWT',
    //     description: 'Ingrese el refresh-token',
    //     in: 'header',
    //   },
    //   'jwt-refresh',
    // )
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {
    swaggerOptions: { persistAuthorization: true },
  });

  app.enableCors({
    origin: envs.feUrl ?? 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
  });

  app.use(cookieParser(envs.cookieKey));

  await app.listen(envs.port);
  logger.log(`App running on port ${envs.port}`);
}
bootstrap();
