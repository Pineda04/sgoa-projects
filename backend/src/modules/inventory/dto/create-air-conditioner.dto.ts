import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateAirConditionerDto {
  @ApiPropertyOptional({
    description: 'Descripción del aire acondicionado.',
    example: 'Aire acondicionado de 12000 BTU',
  })
  @IsString({
    message: 'La propiedad <description> debe ser una cadena de texto.',
  })
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'ID de la marca.',
    example: '65039ef6-1fc5-474c-b4e3-27239c200138',
    required: true,
  })
  @IsUUID('all', { message: 'La propiedad <brandId> debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'La propiedad <brandId> no debe estar vacía.' })
  brandId: string;

  @ApiProperty({
    description: 'ID de la condición.',
    example: '65039ef6-1fc5-474c-b4e3-27239c200138',
    required: true,
  })
  @IsUUID('all', {
    message: 'La propiedad <conditionId> debe ser un UUID válido.',
  })
  @IsNotEmpty({ message: 'La propiedad <conditionId> no debe estar vacía.' })
  conditionId: string;

  @ApiPropertyOptional({
    description: 'ID del aula (opcional).',
    example: '65039ef6-1fc5-474c-b4e3-27239c200138',
  })
  @IsUUID('all', {
    message: 'La propiedad <classroomId> debe ser un UUID válido.',
  })
  @IsOptional()
  classroomId?: string;
}
