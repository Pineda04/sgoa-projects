import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PositionsService } from '../services/positions.service';
import { normalizeText } from 'src/common/utils';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsValidNamePositionConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly positionsService: PositionsService) {}

  async validate(name: string, args?: ValidationArguments): Promise<boolean> {
    if (!name) return true;

    const positions = await this.getPositions();
    return !positions
      .map((pos) => normalizeText(pos.name))
      .includes(normalizeText(name));
  }

  async getPositions() {
    return await this.positionsService.findAll();
  }

  defaultMessage(args?: ValidationArguments): string {
    return `El cargo <$value> ya se encuentra registrado.`;
  }
}
