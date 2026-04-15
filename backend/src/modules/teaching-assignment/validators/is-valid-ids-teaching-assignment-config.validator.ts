import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ETeachingAssignmentConfig } from '../enums';
import { AcademicAssignmentReportsService } from '../services/academic-assignment-reports.service';
import { AcademicPeriodsService } from '../services/academic-periods.service';
import { TeachingSessionsService } from '../services/teaching-sessions.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsValidIdsTeachingAssignmentConfigConstraint
  implements ValidatorConstraintInterface
{
  constructor(
    private readonly academicAssignmentReportsService: AcademicAssignmentReportsService,
    private readonly academicPeriodsService: AcademicPeriodsService,
    private readonly teachingSessionsService: TeachingSessionsService,
  ) {}

  async validate(id: string, args: ValidationArguments): Promise<boolean> {
    if (!id || id === '') return true;

    if (typeof id !== 'string') return false;

    const [configType] = args.constraints as ETeachingAssignmentConfig[];

    switch (configType) {
      case ETeachingAssignmentConfig.ASSIGNMENT:
        return !!(await this.academicAssignmentReportsService.findOne(id));

      case ETeachingAssignmentConfig.PERIOD:
        return !!(await this.academicPeriodsService.findOne(id));

      case ETeachingAssignmentConfig.SESSION:
        return !!(await this.teachingSessionsService.findOne(id));

      default:
        return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    const [configType] = args.constraints as ETeachingAssignmentConfig[];
    const configs: {
      [key in ETeachingAssignmentConfig]: { name: string; endpoint: string };
    } = {
      [ETeachingAssignmentConfig.ASSIGNMENT]: {
        name: 'asignaciones académicas',
        endpoint: '/academic-assignment-reports',
      },
      [ETeachingAssignmentConfig.PERIOD]: {
        name: 'periodos académicos',
        endpoint: '/academic-periods',
      },
      [ETeachingAssignmentConfig.SESSION]: {
        name: 'docencia',
        endpoint: '/teaching-sessions',
      },
    };

    return `El ${args.property} <$value> no fue encontrado en <${configs[configType].name}>, por favor consulte los disponibles en <${configs[configType].endpoint}>.`;
  }
}
