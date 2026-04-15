import { Module } from '@nestjs/common';
import { TeacherCategoriesService } from './services/teacher-categories.service';
import { ContractTypesService } from './services/contract-types.service';
import { ShiftsService } from './services/shifts.service';
import { ContractTypesController } from './controllers/contract-types.controller';
import { ShiftsController } from './controllers/shifts.controller';
import { TeacherCategoriesController } from './controllers/teacher-categories.controller';
import { PositionsController } from './controllers/positions.controller';
import { PositionsService } from './services/positions.service';
import {
  IsValidNamePositionConstraint,
  IsValidPositionIdConstraint,
} from './validators';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    TeacherCategoriesController,
    ContractTypesController,
    ShiftsController,
    PositionsController,
  ],
  providers: [
    TeacherCategoriesService,
    ContractTypesService,
    ShiftsService,
    PositionsService,
    IsValidNamePositionConstraint,
    IsValidPositionIdConstraint,
  ],
  exports: [
    TeacherCategoriesService,
    ContractTypesService,
    ShiftsService,
    PositionsService,
    IsValidNamePositionConstraint,
    IsValidPositionIdConstraint,
  ],
})
export class TeachersConfigModule {}
