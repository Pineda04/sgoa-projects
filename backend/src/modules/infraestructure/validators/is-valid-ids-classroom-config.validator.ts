import {
  registerDecorator,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidatorOptions,
} from 'class-validator';
import { BuildingService } from '../services/building.service';
import { ConnectivityService } from '../services/connectivity.service';
import { AudioEquipmentService } from '../services/audio-equipment.service';
import { Injectable } from '@nestjs/common';
import { RoomTypeService } from '../services/room-type.service';
import { EClassroomConfig } from '../enums';

@ValidatorConstraint({ name: 'isValidIdsClassroomConfig', async: true })
@Injectable()
export class IsValidIdsClassroomConfigConstraint
  implements ValidatorConstraintInterface
{
  constructor(
    private readonly buildingService: BuildingService,
    private readonly roomTypeService: RoomTypeService,
    private readonly connectivityService: ConnectivityService,
    private readonly audioEquipmentService: AudioEquipmentService,
  ) {}

  async validate(id: string, args: ValidationArguments): Promise<boolean> {
    if (!id || id === '') return true;

    if (typeof id !== 'string') return false;

    const [configType] = args.constraints as EClassroomConfig[];

    switch (configType) {
      case EClassroomConfig.BUILDING:
        return !!(await this.buildingService.findOne(id));

      case EClassroomConfig.ROOM_TYPE:
        return !!(await this.roomTypeService.findOne(id));

      case EClassroomConfig.CONNECTIVITY:
        return !!(await this.connectivityService.findOne(id));

      case EClassroomConfig.AUDIO_EQUIPMENT:
        return !!(await this.audioEquipmentService.findOne(id));

      default:
        return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    const [configType] = args.constraints as EClassroomConfig[];
    const configs: {
      [key in EClassroomConfig]: { name: string; endpoint: string };
    } = {
      [EClassroomConfig.BUILDING]: {
        name: 'edificios',
        endpoint: '/buildings',
      },
      [EClassroomConfig.ROOM_TYPE]: {
        name: 'tipo de aula',
        endpoint: '/room-types',
      },
      [EClassroomConfig.CONNECTIVITY]: {
        name: 'conectividad',
        endpoint: '/connectivities',
      },
      [EClassroomConfig.AUDIO_EQUIPMENT]: {
        name: 'equipo de audio',
        endpoint: '/audio-equipments',
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
