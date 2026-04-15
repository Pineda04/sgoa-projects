import { PartialType } from '@nestjs/mapped-types';
import { CreateMultimediaTypeDto } from './create-multimedia-type.dto';

export class UpdateMultimediaTypeDto extends PartialType(
  CreateMultimediaTypeDto,
) {}
