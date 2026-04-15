import { forwardRef, Module } from '@nestjs/common';
import { CourseClassroomsController } from './contollers/course-classrooms.controller';
import { CourseStadisticsController } from './contollers/course-stadistics.controller';
import { CoursesController } from './contollers/courses.controller';
import { ModalitiesController } from './contollers/modalities.controller';
import { CourseClassroomsService } from './services/course-classrooms.service';
import { CourseStadisticsService } from './services/course-stadistics.service';
import { CoursesService } from './services/courses.service';
import { ModalitiesService } from './services/modalities.service';
import {
  ExistsCodeCourseValidator,
  IsValidClassroomConfigConstraint,
} from './validators';
import { TeachingAssignmentModule } from '../teaching-assignment/teaching-assignment.module';
import { TeachersConfigModule } from '../teachers-config/teachers-config.module';
import { TeachersModule } from '../teachers/teachers.module';
import { CentersModule } from '../centers/centers.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => TeachingAssignmentModule),
    TeachersModule,
    TeachersConfigModule,
    CentersModule,
  ],
  controllers: [
    CourseClassroomsController,
    CoursesController,
    ModalitiesController,
    CourseStadisticsController,
  ],
  providers: [
    CourseClassroomsService,
    CoursesService,
    ModalitiesService,
    CourseStadisticsService,
    IsValidClassroomConfigConstraint,
    ExistsCodeCourseValidator,
  ],
  exports: [
    CourseClassroomsService,
    CoursesService,
    ModalitiesService,
    CourseStadisticsService,
    IsValidClassroomConfigConstraint,
    ExistsCodeCourseValidator,
  ],
})
export class CourseClassroomsModule {}
