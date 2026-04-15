import { PartialType } from '@nestjs/mapped-types';
import { CreateAirConditionerDto } from './create-air-conditioner.dto';

export class UpdateAirConditionerDto extends PartialType(
  CreateAirConditionerDto,
) {}
