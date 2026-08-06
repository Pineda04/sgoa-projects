import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ROLE_NAMES } from 'src/common/constants';
import { TTeacher } from 'src/modules/teachers/types';

@ValidatorConstraint({ name: 'TeacherFieldsRequiredForRole', async: false })
@Injectable()
export class TeacherRequiredFieldsForRoleConstraint implements ValidatorConstraintInterface {
  validate(obj: any, args: ValidationArguments): Promise<boolean> | boolean {
    const object = args.object as { roles: string[] } & TTeacher;

    const teacherRoleNames: string[] = [
      ROLE_NAMES.COORDINADOR_AREA,
      ROLE_NAMES.DOCENTE,
    ];

    if (
      !object.roles ||
      !object.roles.some((role) => teacherRoleNames.includes(role))
    )
      return true;

    return (
      !!object.undergradId &&
      !!object.categoryId &&
      !!object.contractTypeId &&
      !!object.shiftId
    );
  }

  defaultMessage(args?: ValidationArguments): string {
    return `Los campos <undergradId, categoryId, contractTypeId, shiftId> son obligatorios si el rol es uno de los siguientes: ${ROLE_NAMES.COORDINADOR_AREA} y ${ROLE_NAMES.DOCENTE}.`;
  }
}
