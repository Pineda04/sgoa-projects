import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiCommonResponses,
  GetCurrentUserId,
  ResponseMessage,
  RequirePermission,
} from 'src/common/decorators';
import { MonitorAssignmentsService } from '../services/monitor-assignments.service';

@Controller('monitor')
export class MonitorAssignmentsController {
  constructor(
    private readonly monitorAssignmentsService: MonitorAssignmentsService,
  ) {}

  @Get('current-assignments')
  @RequirePermission('read', 'schedule-compliance-check')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(
    'Asignaciones del período activo para el día de hoy, agrupadas por edificio y aula.',
  )
  @ApiCommonResponses({
    summary: 'Obtener las asignaciones de hoy para el monitor',
    okDescription: 'Listado de asignaciones obtenido correctamente.',
  })
  findCurrentAssignments(@GetCurrentUserId() monitorId: string) {
    return this.monitorAssignmentsService.findCurrentAssignments(monitorId);
  }

  @Get('buildings')
  @RequirePermission('read', 'schedule-compliance-check')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de edificios disponibles.')
  @ApiCommonResponses({
    summary: 'Obtener los edificios disponibles para el monitor',
    okDescription: 'Listado de edificios obtenido correctamente.',
  })
  findBuildings(@GetCurrentUserId() monitorId: string) {
    return this.monitorAssignmentsService.findBuildings(monitorId);
  }
}
