import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AtGuard, RolesGuard } from './common/guards';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import {
  RequestLoggerInterceptor,
  TransformInterceptor,
} from './common/interceptors';
import { TeachersConfigModule } from './modules/teachers-config/teachers-config.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { CentersModule } from './modules/centers/centers.module';
import { InfraestructureModule } from './modules/infraestructure/infraestructure.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { TeachingAssignmentModule } from './modules/teaching-assignment/teaching-assignment.module';
import { ExcelFilesModule } from './modules/excel-files/excel-files.module';
import { CourseClassroomsModule } from './modules/course-classrooms/course-classrooms.module';
import { ComplementaryActivitiesModule } from './modules/complementary-activities/complementary-activities.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { MailModule } from './modules/mail/mail.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { AppController } from './app.controller';
import { TeachersDegreesModule } from './modules/teachers-degrees/teachers-degrees.module';
import { PlanificatorAiModule } from './modules/planificator-ai/planificator-ai.module';

@Module({
  imports: [
    AuthModule,
    MailModule,
    PrismaModule,
    UsersModule,
    TeachersConfigModule,
    TeachersModule,
    CentersModule,
    InfraestructureModule,
    InventoryModule,
    TeachingAssignmentModule,
    ExcelFilesModule,
    CourseClassroomsModule,
    ComplementaryActivitiesModule,
    CloudinaryModule,
    TeachersDegreesModule,
    PlanificatorAiModule,
  ],
  providers: [
    {
      // automatic inject reflector
      provide: APP_GUARD,
      useClass: AtGuard,
    },
    {
      // automatic inject reflector
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      // automatic inject reflector
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggerInterceptor,
    },
    {
      // automatic inject reflector
      /*
       * para controlar el acceso por roles, este cubre toda la app,
       * pero de ser necesario se puede hacer en los controllers individuales y eliminar este.
       *
       * */
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '/auth', method: RequestMethod.ALL });
  }
}
