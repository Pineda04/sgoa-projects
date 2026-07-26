import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CheckFiltersDto } from './check-filters.dto';
import { EReportGroupBy } from '../enums';

export class ReportFiltersDto extends CheckFiltersDto {
  @ApiPropertyOptional({
    description: 'Criterio de agrupación del reporte',
    enum: EReportGroupBy,
  })
  @IsOptional()
  @IsEnum(EReportGroupBy)
  groupBy?: EReportGroupBy;
}
