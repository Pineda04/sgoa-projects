import { PartialType } from '@nestjs/mapped-types';
import { CreateAudioEquipmentDto } from './create-audio-equipment.dto';

export class UpdateAudioEquipmentDto extends PartialType(
  CreateAudioEquipmentDto,
) {}
