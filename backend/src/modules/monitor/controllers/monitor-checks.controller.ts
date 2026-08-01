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
  Roles,
} from 'src/common/decorators';
import { EUserRole } from 'src/common/enums';
import { BatchSyncChecksDto, CheckFiltersDto, CreateCheckDto } from '../dto';
import { MonitorChecksService } from '../services/monitor-checks.service';

@Controller('monitor/checks')
export class MonitorChecksController {
  constructor(private readonly monitorChecksService: MonitorChecksService) {}

  @Post()
  @Roles(EUserRole.MONITOR)
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

  @Post('batch-sync')
  @Roles(EUserRole.MONITOR)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Verificaciones offline sincronizadas correctamente.')
  @ApiBody({
    type: BatchSyncChecksDto,
    description:
      'Lista de verificaciones registradas localmente sin conexión a internet.',
  })
  @ApiCommonResponses({
    summary: 'Sincronizar verificaciones registradas offline',
    okDescription: 'Verificaciones sincronizadas correctamente.',
    badRequestDescription: 'El formato del payload es inválido.',
  })
  batchSync(
    @GetCurrentUserId() monitorId: string,
    @Body() dto: BatchSyncChecksDto,
  ) {
    return this.monitorChecksService.batchSync(monitorId, dto);
  }

  @Get()
  @Roles(EUserRole.MONITOR, EUserRole.ADMIN)
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
