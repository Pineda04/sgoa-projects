import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiCommonResponses,
  ResponseMessage,
  Roles,
} from 'src/common/decorators';
import { EUserRole } from 'src/common/enums';
import { MonitorAssignmentsService } from '../services/monitor-assignments.service';

@Controller('monitor')
@Roles(EUserRole.MONITOR)
export class MonitorAssignmentsController {
  constructor(
    private readonly monitorAssignmentsService: MonitorAssignmentsService,
  ) {}

  @Get('current-assignments')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(
    'Asignaciones del período activo para el día de hoy, agrupadas por edificio y aula.',
  )
  @ApiCommonResponses({
    summary: 'Obtener las asignaciones de hoy para el monitor',
    okDescription: 'Listado de asignaciones obtenido correctamente.',
  })
  findCurrentAssignments() {
    return this.monitorAssignmentsService.findCurrentAssignments();
  }

  @Get('buildings')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de edificios disponibles.')
  @ApiCommonResponses({
    summary: 'Obtener los edificios disponibles para el monitor',
    okDescription: 'Listado de edificios obtenido correctamente.',
  })
  findBuildings() {
    return this.monitorAssignmentsService.findBuildings();
  }
}
