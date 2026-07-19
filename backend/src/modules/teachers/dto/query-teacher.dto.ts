import { IsOptional, IsString, IsUUID } from 'class-validator';
import { QueryPaginationDto } from 'src/common/dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryTeacherDto extends QueryPaginationDto {
  @ApiPropertyOptional({
    description: 'Buscar por nombre o código del docente',
  })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de categoría',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de tipo de contratación',
  })
  @IsOptional()
  @IsUUID()
  contractTypeId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID del periodo académico',
  })
  @IsOptional()
  @IsUUID()
  periodId?: string;
}
