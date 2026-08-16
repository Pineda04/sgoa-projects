import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional, IsUUID, Matches } from 'class-validator';
import { QueryPaginationDto } from 'src/common/dto';

export class CheckFiltersDto extends QueryPaginationDto {
  @IsOptional()
  @Matches(/^[1-9]\d{0,5}$/, {
    message: 'La propiedad <page> debe ser un entero entre 1 y 999999.',
  })
  declare page?: string;

  @IsOptional()
  @Matches(/^(?:[1-9]\d{0,3})$/, {
    message: 'La propiedad <size> debe ser un entero entre 1 y 5000.',
  })
  declare size?: string;

  @ApiPropertyOptional({
    description: 'Fecha inicial del rango de búsqueda (ISO 8601)',
    example: '2026-07-01',
  })
  @IsOptional()
  @IsISO8601()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Fecha final del rango de búsqueda (ISO 8601)',
    example: '2026-07-31',
  })
  @IsOptional()
  @IsISO8601()
  dateTo?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID del docente de la sección verificada',
  })
  @IsOptional()
  @IsUUID()
  teacherId?: string;

  @ApiPropertyOptional({
    description:
      'Filtrar por ID del edificio donde se ubica el aula verificada',
  })
  @IsOptional()
  @IsUUID()
  buildingId?: string;

  @ApiPropertyOptional({
    description:
      'Filtrar por ID del centro al que pertenece el edificio verificado',
  })
  @IsOptional()
  @IsUUID()
  centerId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por período académico' })
  @IsOptional()
  @IsUUID()
  periodId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por centro-departamento' })
  @IsOptional()
  @IsUUID()
  centerDepartmentId?: string;
}
