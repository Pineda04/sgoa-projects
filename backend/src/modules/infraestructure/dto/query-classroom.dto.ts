import { IsBooleanString, IsOptional, IsString, IsUUID } from 'class-validator';
import { QueryPaginationDto } from 'src/common/dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryClassroomDto extends QueryPaginationDto {
  @ApiPropertyOptional({
    description: 'Filtrar por nombre del aula (búsqueda parcial)',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID del edificio',
  })
  @IsOptional()
  @IsUUID()
  buildingId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID del tipo de aula',
  })
  @IsOptional()
  @IsUUID()
  roomTypeId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado (true = activa, false = inactiva)',
  })
  @IsOptional()
  @IsBooleanString()
  activeStatus?: string;
}
