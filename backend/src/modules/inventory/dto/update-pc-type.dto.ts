import { PartialType } from '@nestjs/mapped-types';
import { CreatePcTypeDto } from './create-pc-type.dto';

export class UpdatePcTypeDto extends PartialType(CreatePcTypeDto) {}
