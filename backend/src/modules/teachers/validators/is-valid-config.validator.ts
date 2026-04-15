import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { EConfigType } from '../enums';
import { ShiftsService } from 'src/modules/teachers-config/services/shifts.service';
import { ContractTypesService } from 'src/modules/teachers-config/services/contract-types.service';
import { TeacherCategoriesService } from 'src/modules/teachers-config/services/teacher-categories.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsValidConfigTeacherConstraint
  implements ValidatorConstraintInterface
{
  private cache = new Map<string, string[]>();

  constructor(
    private readonly shiftsService: ShiftsService,
    private readonly contractTypesService: ContractTypesService,
    private readonly teacherCategoriesService: TeacherCategoriesService,
  ) {}

  async validate(
    configId: string,
    args: ValidationArguments,
  ): Promise<boolean> {
    const [configType] = args.constraints as EConfigType[];

    if (this.cache.has(configType))
      return this.cache.get(configType)!.includes(configId);

    let validIds: string[] = [];

    if (configType === EConfigType.SHIFT) {
      validIds = await this.getShiftsIds();
    }

    if (configType === EConfigType.CONTRACT) {
      validIds = await this.getContractTypesIds();
    }

    if (configType === EConfigType.CATEGORY) {
      validIds = await this.getTeacherCategoriesIds();
    }

    if (validIds.length === 0) return false;

    this.cache.set(configType, validIds);

    return validIds.includes(configId);
  }

  async getShiftsIds(): Promise<string[]> {
    const shifts = await this.shiftsService.findAll();
    return shifts.map((el) => el.id);
  }

  async getContractTypesIds(): Promise<string[]> {
    const contractTypes = await this.contractTypesService.findAll();
    return contractTypes.map((el) => el.id);
  }

  async getTeacherCategoriesIds(): Promise<string[]> {
    const teacherCategories = await this.teacherCategoriesService.findAll();
    return teacherCategories.map((el) => el.id);
  }

  defaultMessage(args: ValidationArguments): string {
    const [configType] = args.constraints as EConfigType[];
    const configs: { [key: string]: { name: string; endpoint: string } } = {
      [EConfigType.SHIFT]: { name: 'jornada', endpoint: '/shifts' },
      [EConfigType.CONTRACT]: {
        name: 'tipo de contrato',
        endpoint: '/contract-types',
      },
      [EConfigType.CATEGORY]: {
        name: 'categoría de docentes',
        endpoint: '/teacher-categories',
      },
    };

    return `El ${args.property} <$value> no fue encontrado en <${configs[configType].name}>, por favor consulte los disponibles en <${configs[configType].endpoint}>.`;
  }
}

// export function IsValidConfigTeacher(configType: EConfigType) {
//   return function (object: object, propertyName: string) {
//     registerDecorator({
//       target: object.constructor,
//       propertyName: propertyName,
//       constraints: [configType],
//       validator: IsValidConfigTeacherConstraint,
//     });
//   };
// }
