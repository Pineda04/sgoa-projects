import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { CourseClassroomsService } from '../services/course-classrooms.service';
import { CourseStadisticsService } from '../services/course-stadistics.service';
import { CoursesService } from '../services/courses.service';
import { ModalitiesService } from '../services/modalities.service';
import { ECourseClassroomConfig } from '../enums';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsValidClassroomConfigConstraint
  implements ValidatorConstraintInterface
{
  constructor(
    private readonly courseClassroomsService: CourseClassroomsService,
    private readonly courseStadisticsService: CourseStadisticsService,
    private readonly coursesService: CoursesService,
    private readonly modalitiesService: ModalitiesService,
  ) {}

  async validate(value: string, args: ValidationArguments): Promise<boolean> {
    if (!value || value === '') return true;

    if (typeof value !== 'string') return false;

    const [configType] = args.constraints as ECourseClassroomConfig[];

    switch (configType) {
      case ECourseClassroomConfig.COURSE_CLASSROOM:
        return !!(await this.courseClassroomsService.findOne(value));

      case ECourseClassroomConfig.STADISTIC:
        return !!(await this.courseStadisticsService.findOne(value));

      case ECourseClassroomConfig.COURSE:
        return !!(await this.coursesService.findOne(value));

      case ECourseClassroomConfig.MODALITY:
        return !!(await this.modalitiesService.findOne(value));

      case ECourseClassroomConfig.COURSE_CODE:
        return !!(await this.coursesService.findOneByCode(value));

      default:
        return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    const [configType] = args.constraints as ECourseClassroomConfig[];
    const configs: {
      [key in ECourseClassroomConfig]: { name: string; endpoint: string };
    } = {
      [ECourseClassroomConfig.COURSE_CLASSROOM]: {
        name: 'sección de asignatura',
        endpoint: '/course-classrooms',
      },
      [ECourseClassroomConfig.STADISTIC]: {
        name: 'estadística de sección de asignatura',
        endpoint: '/course-stadistics',
      },
      [ECourseClassroomConfig.COURSE]: {
        name: 'asignatura',
        endpoint: '/courses',
      },
      [ECourseClassroomConfig.MODALITY]: {
        name: 'modalidad',
        endpoint: '/modalities',
      },
      [ECourseClassroomConfig.COURSE_CODE]: {
        name: 'código de asignatura',
        endpoint: '/courses',
      },
    };

    return `El ${args.property} <$value> no fue encontrado en <${configs[configType].name}>, por favor consulte los disponibles en <${configs[configType].endpoint}>.`;
  }
}
