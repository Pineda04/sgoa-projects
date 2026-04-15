import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DepartmentsService } from '../services/departments.service';
import { normalizeText } from 'src/common/utils';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsValidNameDepartmentConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly departmentsService: DepartmentsService) {}

  async validate(name: string, args?: ValidationArguments): Promise<boolean> {
    if (!name) return true;

    const departments = await this.getDepartments();
    return !departments
      .map((dep) => normalizeText(dep.name))
      .includes(normalizeText(name));
  }

  async getDepartments() {
    return await this.departmentsService.findAll();
  }

  defaultMessage(args?: ValidationArguments): string {
    return `El departamento <$value> ya se encuentra registrado.`;
  }
}
