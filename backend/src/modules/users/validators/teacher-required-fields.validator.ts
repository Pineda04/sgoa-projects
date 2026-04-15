import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { EUserRole } from 'src/common/enums';
import { TTeacher } from 'src/modules/teachers/types';

@ValidatorConstraint({ name: 'TeacherFieldsRequiredForRole', async: false })
@Injectable()
export class TeacherRequiredFieldsForRoleConstraint
  implements ValidatorConstraintInterface
{
  validate(obj: any, args: ValidationArguments): Promise<boolean> | boolean {
    const object = args.object as { role: EUserRole } & TTeacher;

    if (![EUserRole.COORDINADOR_AREA, EUserRole.DOCENTE].includes(object.role))
      return true;

    return (
      !!object.undergradId &&
      !!object.categoryId &&
      !!object.contractTypeId &&
      !!object.shiftId
    );
  }

  defaultMessage(args?: ValidationArguments): string {
    return `Los campos <undergradId, categoryId, contractTypeId, shiftId> son obligatorios si el rol es uno de los siguientes: ${EUserRole.COORDINADOR_AREA} y ${EUserRole.DOCENTE}.`;
  }
}
