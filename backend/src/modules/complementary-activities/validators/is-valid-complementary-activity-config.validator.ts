import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { EComplementaryActivityConfig } from '../enums';
import { ActivityTypesService } from '../services/activity-types.service';
import { ComplementaryActivitiesService } from '../services/complementary-activities.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsValidComplementaryActivityConfigConstraint
  implements ValidatorConstraintInterface
{
  constructor(
    private readonly complementaryActivitiesService: ComplementaryActivitiesService,
    private readonly activityTypesService: ActivityTypesService,
  ) {}

  async validate(value: string, args: ValidationArguments): Promise<boolean> {
    if (!value || value === '') return true;

    if (typeof value !== 'string') return false;

    const [configType] = args.constraints as EComplementaryActivityConfig[];

    switch (configType) {
      case EComplementaryActivityConfig.COMPLEMENTARY:
        return !!(await this.complementaryActivitiesService.findOne(value));

      case EComplementaryActivityConfig.ACTIVITY_TYPE:
        return !!(await this.activityTypesService.findOne(value));

      default:
        return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    const [configType] = args.constraints as EComplementaryActivityConfig[];
    const configs: {
      [key in EComplementaryActivityConfig]: { name: string; endpoint: string };
    } = {
      [EComplementaryActivityConfig.COMPLEMENTARY]: {
        name: 'actividades complementarias',
        endpoint: '/complementary-activities/my',
      },
      [EComplementaryActivityConfig.ACTIVITY_TYPE]: {
        name: 'tipos de actividades',
        endpoint: '/activity-types',
      },
    };

    return `El ${args.property} <$value> no fue encontrado en <${configs[configType].name}>, por favor consulte los disponibles en <${configs[configType].endpoint}>.`;
  }
}
