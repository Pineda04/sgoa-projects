import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DepartmentsService } from '../services/departments.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsValidDepartmentIdConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly departmentsService: DepartmentsService) {}

  async validate(
    departmentId: string,
    args: ValidationArguments,
  ): Promise<boolean> {
    if (!departmentId || departmentId === '') return true;

    if (typeof departmentId !== 'string') return false;

    return !!(await this.departmentsService.findOne(departmentId));
  }

  defaultMessage(): string {
    return 'Por favor ingrese un id válido para <departmentId>.';
  }
}
