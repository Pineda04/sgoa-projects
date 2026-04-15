import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PositionsService } from '../services/positions.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsValidPositionIdConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly positionsService: PositionsService) {}

  async validate(
    positionId: string,
    args: ValidationArguments,
  ): Promise<boolean> {
    if (!positionId || positionId === '') return true;

    if (typeof positionId !== 'string') return false;

    return !!(await this.positionsService.findOne(positionId));
  }

  defaultMessage(): string {
    return 'Por favor ingrese un id válido para <positionId>.';
  }
}
