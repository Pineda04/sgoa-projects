import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import {
  ApiCommonResponses,
  ResponseMessage,
  RequirePermission,
} from 'src/common/decorators';
import { ReportFiltersDto } from '../dto';
import { MonitorReportsService } from '../services/monitor-reports.service';

@Controller('monitor/checks')
export class MonitorReportsController {
  constructor(private readonly monitorReportsService: MonitorReportsService) {}

  @Get('report')
  @RequirePermission('read', 'reports-monitor')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Reporte consolidado de cumplimiento de horarios.')
  @ApiCommonResponses({
    summary: 'Obtener el reporte consolidado de cumplimiento de horarios',
    description:
      'Devuelve el total de chequeos, presentes, ausentes y porcentaje de cumplimiento. Acepta filtros por fecha, docente, edificio y centro, y puede agruparse por día, docente o edificio mediante el parámetro groupBy.',
    okDescription: 'Reporte generado correctamente.',
  })
  getReport(@Query() query: ReportFiltersDto) {
    return this.monitorReportsService.getReport(query);
  }
}
