import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import {
  ApiCommonResponses,
  GetCurrentUserId,
  ResponseMessage,
  Roles,
} from 'src/common/decorators';
import { EUserRole } from 'src/common/enums';
import { ReportFiltersDto } from '../dto';
import { MonitorReportsService } from '../services/monitor-reports.service';

@Controller('monitor/checks')
@Roles(EUserRole.MONITOR, EUserRole.ADMIN, EUserRole.DIRECCION)
export class MonitorReportsController {
  constructor(private readonly monitorReportsService: MonitorReportsService) {}

  @Get('report')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Reporte consolidado de cumplimiento de horarios.')
  @ApiCommonResponses({
    summary: 'Obtener el reporte consolidado de cumplimiento de horarios',
    description:
      'Devuelve el total de chequeos, presentes, ausentes y porcentaje de cumplimiento. Acepta filtros por fecha, docente, edificio y centro, y puede agruparse por día, docente o edificio mediante el parámetro groupBy.',
    okDescription: 'Reporte generado correctamente.',
  })
  getReport(
    @GetCurrentUserId() userId: string,
    @Query() query: ReportFiltersDto,
  ) {
    return this.monitorReportsService.getReport(userId, query);
  }
}
