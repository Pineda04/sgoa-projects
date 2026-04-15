import { IntersectionType, PartialType } from '@nestjs/mapped-types';
import { CreateComplementaryActivityDto } from './create-complementary-activity.dto';
import { UpdateVerificationMediaWithFilesDto } from './update-verification-media.dto';

export class UpdateComplementaryActivityDto extends PartialType(
  CreateComplementaryActivityDto,
) {}

export class UpdateComplementaryActivityWithFilesDto extends IntersectionType(
  PartialType(CreateComplementaryActivityDto),
  UpdateVerificationMediaWithFilesDto,
) {}
