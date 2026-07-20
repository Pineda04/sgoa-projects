import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional, IsUUID } from 'class-validator';
import { QueryPaginationDto } from 'src/common/dto';

export class CheckFiltersDto extends QueryPaginationDto {
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
}
