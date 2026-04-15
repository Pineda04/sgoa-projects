import { PartialType } from '@nestjs/mapped-types';
import { CreateUndergradDto } from './create-undergrad.dto';

export class UpdateUndergradDto extends PartialType(CreateUndergradDto) {}
