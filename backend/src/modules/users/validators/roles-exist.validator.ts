import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { RolesService } from '../services/roles.service';

@ValidatorConstraint({ name: 'RolesExistByName', async: true })
@Injectable()
export class RolesExistByNameConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly rolesService: RolesService) {}

  async validate(roles: unknown): Promise<boolean> {
    if (!Array.isArray(roles) || roles.length === 0) return true;

    const foundRoles = await this.rolesService.findManyByNames(roles);

    return foundRoles.length === roles.length;
  }

  defaultMessage(args?: ValidationArguments): string {
    return 'Alguno de los roles proporcionados no existe.';
  }
}
