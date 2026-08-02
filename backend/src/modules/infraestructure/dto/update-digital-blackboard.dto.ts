import { PartialType } from '@nestjs/mapped-types';
import { CreateDigitalBlackboardDto } from './create-digital-blackboard.dto';

export class UpdateDigitalBlackboardDto extends PartialType(
  CreateDigitalBlackboardDto,
) {}