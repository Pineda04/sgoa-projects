import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { TTeacher } from 'src/modules/teachers/types';

@ValidatorConstraint({ name: 'TeacherFieldsRequired', async: false })
@Injectable()
export class TeacherRequiredFieldsForRoleConstraint implements ValidatorConstraintInterface {
  validate(obj: any, args: ValidationArguments): Promise<boolean> | boolean {
    const object = args.object as TTeacher;

    return (
      !!object.undergradId &&
      !!object.categoryId &&
      !!object.contractTypeId &&
      !!object.shiftId
    );
  }

  defaultMessage(args?: ValidationArguments): string {
    return `Los campos <undergradId, categoryId, contractTypeId, shiftId> son obligatorios: todo usuario creado registra su perfil de docente.`;
  }
}
