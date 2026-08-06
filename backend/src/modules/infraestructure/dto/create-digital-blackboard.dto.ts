import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ValidatorConstraintDecorator } from 'src/common/decorators';
import { IsValidIdsInventoryConfigConstraint } from 'src/modules/inventory/validators';
import { EInventoryConfig } from 'src/modules/inventory/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDigitalBlackboardDto {
  @ApiPropertyOptional({
    description: 'Descripción de la pizarra digital.',
    example: 'Pizarra digital interactiva de 65 pulgadas.',
  })
  @IsOptional()
  @IsString({
    message: 'La propiedad <description> debe ser una cadena de texto.',
  })
  description?: string;

  @ApiProperty({
    description: 'ID de la marca de la pizarra digital.',
    example: '65039ef6-1fc5-474c-b4e3-27239c200138',
    required: true,
  })
  @IsUUID('all', {
    message: 'La propiedad <brandId> debe ser un UUID válido.',
  })
  @IsNotEmpty({ message: 'La propiedad <brandId> no debe estar vacía.' })
  @ValidatorConstraintDecorator(
    EInventoryConfig.BRAND,
    IsValidIdsInventoryConfigConstraint,
  )
  brandId: string;

  @ApiProperty({
    description: 'ID del tipo de monitor de la pizarra digital.',
    example: '65039ef6-1fc5-474c-b4e3-27239c200138',
    required: true,
  })
  @IsUUID('all', {
    message: 'La propiedad <monitorTypeId> debe ser un UUID válido.',
  })
  @IsNotEmpty({ message: 'La propiedad <monitorTypeId> no debe estar vacía.' })
  @ValidatorConstraintDecorator(
    EInventoryConfig.MONITOR_TYPE,
    IsValidIdsInventoryConfigConstraint,
  )
  monitorTypeId: string;

  @ApiProperty({
    description: 'ID del tamaño de monitor de la pizarra digital.',
    example: '65039ef6-1fc5-474c-b4e3-27239c200138',
    required: true,
  })
  @IsUUID('all', {
    message: 'La propiedad <monitorSizeId> debe ser un UUID válido.',
  })
  @IsNotEmpty({ message: 'La propiedad <monitorSizeId> no debe estar vacía.' })
  @ValidatorConstraintDecorator(
    EInventoryConfig.MONITOR_SIZE,
    IsValidIdsInventoryConfigConstraint,
  )
  monitorSizeId: string;

  @ApiProperty({
    description: 'ID de la condición de la pizarra digital.',
    example: '65039ef6-1fc5-474c-b4e3-27239c200138',
    required: true,
  })
  @IsUUID('all', {
    message: 'La propiedad <conditionId> debe ser un UUID válido.',
  })
  @IsNotEmpty({ message: 'La propiedad <conditionId> no debe estar vacía.' })
  @ValidatorConstraintDecorator(
    EInventoryConfig.CONDITION,
    IsValidIdsInventoryConfigConstraint,
  )
  conditionId: string;

  @ApiPropertyOptional({
    description: 'ID del aula asignada (opcional).',
    example: '65039ef6-1fc5-474c-b4e3-27239c200138',
  })
  @IsUUID('all', {
    message: 'La propiedad <classroomId> debe ser un UUID válido.',
  })
  @IsOptional()
  classroomId?: string;
}
