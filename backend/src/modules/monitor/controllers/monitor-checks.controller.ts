import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import {
  ApiCommonResponses,
  ApiPagination,
  GetCurrentUserId,
  ResponseMessage,
  RequirePermission,
} from 'src/common/decorators';
import { CheckFiltersDto, CreateCheckDto } from '../dto';
import { MonitorChecksService } from '../services/monitor-checks.service';

@Controller('monitor/checks')
export class MonitorChecksController {
  constructor(private readonly monitorChecksService: MonitorChecksService) {}

  @Post()
  @RequirePermission('create', 'schedule-compliance-check')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage(
    'Se ha registrado la verificación de cumplimiento de horario.',
  )
  @ApiBody({
    type: CreateCheckDto,
    description: 'Datos de la verificación de cumplimiento de horario.',
  })
  @ApiCommonResponses({
    summary: 'Registrar una verificación de cumplimiento de horario',
    createdDescription: 'Verificación registrada correctamente.',
    badRequestDescription:
      'Datos inválidos o ya existe una verificación para esa fecha y hora.',
    notFoundDescription: 'La sección de asignatura no existe.',
  })
  create(
    @GetCurrentUserId() monitorId: string,
    @Body() createCheckDto: CreateCheckDto,
  ) {
    return this.monitorChecksService.create(monitorId, createCheckDto);
  }

  @Get()
  @RequirePermission('read', 'schedule-compliance-check')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de verificaciones de cumplimiento de horario.')
  @ApiPagination({
    summary: 'Obtener las verificaciones de cumplimiento de horario',
    description:
      'Devuelve un listado paginado de verificaciones, con filtros opcionales por fecha, docente, edificio y centro.',
  })
  @ApiCommonResponses({
    summary: 'Listar verificaciones de cumplimiento de horario',
    okDescription: 'Listado obtenido correctamente.',
  })
  findAll(@Query() query: CheckFiltersDto) {
    return this.monitorChecksService.findAllWithFilters(query);
  }
}
