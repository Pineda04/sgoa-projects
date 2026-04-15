import { PartialType } from '@nestjs/mapped-types';
import { CreatePcEquipmentDto } from './create-pc-equipment.dto';

export class UpdatePcEquipmentDto extends PartialType(CreatePcEquipmentDto) {}
