import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { ClassroomService } from 'src/modules/infraestructure/services/classroom.service';
import { BrandsService } from '../services/brands.service';
import { ConditionsService } from '../services/conditions.service';
import { MonitorSizesService } from '../services/monitor-sizes.service';
import { MonitorTypesService } from '../services/monitor-types.service';
import { PcTypesService } from '../services/pc-types.service';
import { EInventoryConfig } from '../enums/inventory-config.enum';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsValidIdsInventoryConfigConstraint
  implements ValidatorConstraintInterface
{
  constructor(
    private readonly brandsService: BrandsService,
    private readonly conditionsService: ConditionsService,
    private readonly monitorTypesService: MonitorTypesService,
    private readonly monitorSizesService: MonitorSizesService,
    private readonly pcTypesService: PcTypesService,
    private readonly classroomService: ClassroomService,
  ) {}

  async validate(id: string, args: ValidationArguments): Promise<boolean> {
    if (!id || id === '') return true;

    if (typeof id !== 'string') return false;

    const [configType] = args.constraints as EInventoryConfig[];

    switch (configType) {
      case EInventoryConfig.BRAND:
        return !!(await this.brandsService.findOne(id));

      case EInventoryConfig.CONDITION:
        return !!(await this.conditionsService.findOne(id));

      case EInventoryConfig.MONITOR_TYPE:
        return !!(await this.monitorTypesService.findOne(id));

      case EInventoryConfig.MONITOR_SIZE:
        return !!(await this.monitorSizesService.findOne(id));

      case EInventoryConfig.PC_TYPE:
        return !!(await this.pcTypesService.findOne(id));

      case EInventoryConfig.CLASSROOM:
        return !!(await this.classroomService.findOne(id));

      default:
        return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    const [configType] = args.constraints as EInventoryConfig[];
    const configs: {
      [key in EInventoryConfig]: { name: string; endpoint: string };
    } = {
      [EInventoryConfig.BRAND]: {
        name: 'marcas',
        endpoint: '/brands',
      },
      [EInventoryConfig.CONDITION]: {
        name: 'condición',
        endpoint: '/conditions',
      },
      [EInventoryConfig.MONITOR_TYPE]: {
        name: 'tipos de monitores',
        endpoint: '/monitor-types',
      },
      [EInventoryConfig.MONITOR_SIZE]: {
        name: 'tamaños de monitores',
        endpoint: '/monitor-sizes',
      },
      [EInventoryConfig.PC_TYPE]: {
        name: 'tipos de pc',
        endpoint: '/pc-types',
      },
      [EInventoryConfig.CLASSROOM]: {
        name: 'aulas',
        endpoint: '/classrooms',
      },
    };

    return `El ${args.property} <$value> no fue encontrado en <${configs[configType].name}>, por favor consulte los disponibles en <${configs[configType].endpoint}>.`;
  }
}

// export function IsValidIdsClassroomConfig(
//   configType: EClassroomConfig,
//   validationOptions?: ValidatorOptions,
// ): PropertyDecorator {
//   return function (object: object, propertyName: string | symbol) {
//     registerDecorator({
//       target: object.constructor,
//       propertyName: propertyName as string,
//       options: validationOptions,
//       constraints: [configType],
//       validator: IsValidIdsClassroomConfigConstraint,
//     });
//   };
// }
