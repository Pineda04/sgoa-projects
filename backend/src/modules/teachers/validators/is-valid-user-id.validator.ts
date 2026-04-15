import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UsersService } from 'src/modules/users/services/users.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsValidUserIdConstraint implements ValidatorConstraintInterface {
  constructor(private readonly usersService: UsersService) {}

  async validate(userId: string, args: ValidationArguments): Promise<boolean> {
    if (!userId || userId === '') return true;

    if (typeof userId !== 'string') return false;

    return !!(await this.usersService.findOne(userId));
  }

  defaultMessage(): string {
    return 'Por favor ingrese un id válido para <userId>.';
  }
}
