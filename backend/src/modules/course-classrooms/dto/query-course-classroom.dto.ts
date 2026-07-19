import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { QueryPaginationDto } from 'src/common/dto';

const VALID_DAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

export class QueryCourseClassroomDto extends QueryPaginationDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID del periodo académico',
  })
  @IsOptional()
  @IsUUID()
  periodId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por día de la semana (Lu, Ma, Mi, Ju, Vi, Sa, Do)',
    enum: VALID_DAYS,
  })
  @IsOptional()
  @IsIn(VALID_DAYS, {
    message:
      'El parámetro <dayOfWeek> debe ser uno de: Lu, Ma, Mi, Ju, Vi, Sa o Do.',
  })
  dayOfWeek?: string;
}
