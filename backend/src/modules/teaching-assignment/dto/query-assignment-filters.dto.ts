import { IsOptional, IsNumberString, IsUUID, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryAssignmentFiltersDto {
  @ApiPropertyOptional({
    description: 'Año para filtrar los informes',
    example: '2026',
  })
  @IsOptional()
  @IsNumberString(
    { no_symbols: true },
    {
      message: 'El valor de <year> debe ser un número entero.',
    },
  )
  year?: string;

  @ApiPropertyOptional({
    description: 'Número de PAC para filtrar los informes',
    example: '1',
  })
  @IsOptional()
  @IsNumberString(
    { no_symbols: true },
    {
      message: 'El valor de <pac> debe ser un número entero.',
    },
  )
  pac?: string;

  @ApiPropertyOptional({
    description: 'ID del departamento para filtrar los informes',
    example: '65039ef6-1fc5-474c-b4e3-27239c200138',
  })
  @IsOptional()
  @IsUUID('all', {
    message: 'La propiedad <departmentId> debe ser un UUID válido.',
  })
  departmentId?: string;

  @ApiPropertyOptional({
    description: 'ID del centro para filtrar los informes',
    example: '65039ef6-1fc5-474c-b4e3-27239c200138',
  })
  @IsOptional()
  @IsUUID('all', {
    message: 'La propiedad <centerId> debe ser un UUID válido.',
  })
  centerId?: string;

  @ApiPropertyOptional({
    description: 'Nombre del docente para filtrar los informes',
    example: 'Ever Josue',
  })
  @IsOptional()
  @IsString({
    message: 'La propiedad <teacherName> debe ser un texto válido.',
  })
  teacherName?: string;
}
