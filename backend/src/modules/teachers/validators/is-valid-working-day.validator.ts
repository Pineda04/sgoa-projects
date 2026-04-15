import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { CreateTeacherDto } from '../dto/create-teacher.dto';
import { hourToDateUTC } from 'src/common/utils';

@ValidatorConstraint({ name: 'valid-wordkig-day', async: false })
@Injectable()
export class IsValidWorkinDayConstraint
  implements ValidatorConstraintInterface
{
  private error: {
    type: 'missing' | 'compare' | 'global';
    field: 'shiftStart' | 'shiftEnd' | 'both';
  };

  validate(_: unknown, args: ValidationArguments): Promise<boolean> | boolean {
    const obj = args.object as Pick<
      CreateTeacherDto,
      'shiftStart' | 'shiftEnd'
    >;
    const shiftStart = obj.shiftStart;
    const shiftEnd = obj.shiftEnd;

    const isEmpty = (value: unknown) =>
      value === undefined || value === null || value === '';

    if (
      (isEmpty(shiftStart) && !isEmpty(shiftEnd)) ||
      (!isEmpty(shiftStart) && isEmpty(shiftEnd))
    ) {
      this.error = {
        type: 'missing',
        field: isEmpty(shiftStart) ? 'shiftStart' : 'shiftEnd',
      };

      return false;
    }

    const compare =
      !isEmpty(shiftStart) &&
      !isEmpty(shiftEnd) &&
      hourToDateUTC(shiftStart).getTime() < hourToDateUTC(shiftEnd).getTime();

    if (!compare) {
      this.error = {
        type: 'compare',
        field: 'shiftEnd',
      };

      return false;
    }

    return true;
  }

  defaultMessage(_: ValidationArguments): string {
    const messages = {
      missing: {
        shiftStart:
          'Debe incluir también <shiftStart> cuando envía <shiftEnd>.',
        shiftEnd: 'Debe incluir también <shiftEnd> cuando envía <shiftStart>.',
      },
      compare: {
        // shiftStart:
        //   'La hora de inicio <shiftStart> debe ser menor a la hora de finalización <shiftEnd>.',
        shiftEnd:
          'La hora de inicio <shiftStart> debe ser menor a la hora de finalización <shiftEnd>.',
        // both: 'La hora de inicio <shiftStart> debe ser menor a la hora de finalización <shiftEnd>.',
      },
      global: {
        both: '<shiftStart> y <shiftEnd> deben venir ambos o ninguno.',
      },
    };

    const { type, field } = this.error;

    return messages[type][field] as string;
  }
}
