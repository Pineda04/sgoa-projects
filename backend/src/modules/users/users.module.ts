import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { RolesService } from './services/roles.service';
import { RolesController } from './controllers/roles.controller';
import { TeacherRequiredFieldsForRoleConstraint } from './validators/teacher-required-fields.validator';
import { TeachersModule } from '../teachers/teachers.module';
import { MailModule } from '../mail/mail.module';
import { TeachersConfigModule } from '../teachers-config/teachers-config.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => TeachersModule),
    forwardRef(() => TeachersConfigModule),
    MailModule,
  ],
  controllers: [UsersController, RolesController],
  providers: [
    UsersService,
    RolesService,
    TeacherRequiredFieldsForRoleConstraint,
  ],
  exports: [UsersService, RolesService],
})
export class UsersModule {}
