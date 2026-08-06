import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse } from '@nestjs/swagger';
import {
  ApiCommonResponses,
  ApiPagination,
  GetCurrentUserId,
  ResponseMessage,
  RequirePermission,
} from 'src/common/decorators';
import { ValidateIdPipe } from 'src/common/pipes';
import {
  BatchSyncChecksDto,
  CheckFiltersDto,
  CreateCheckDto,
  UpdateCheckDto,
} from '../dto';
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

  @Patch(':id')
  @RequirePermission('update', 'schedule-compliance-check')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(
    'Se ha actualizado la verificación de cumplimiento de horario.',
  )
  @ApiBody({
    type: UpdateCheckDto,
    description:
      'Datos a modificar de la verificación de cumplimiento de horario.',
  })
  @ApiCommonResponses({
    summary: 'Actualizar una verificación de cumplimiento de horario',
    okDescription: 'Verificación actualizada correctamente.',
    badRequestDescription: 'Datos inválidos.',
    notFoundDescription: 'La verificación no existe.',
  })
  update(
    @GetCurrentUserId() monitorId: string,
    @Param('id', ValidateIdPipe) id: string,
    @Body() updateCheckDto: UpdateCheckDto,
  ) {
    return this.monitorChecksService.update(monitorId, id, updateCheckDto);
  }

  @Post('batch-sync')
  @RequirePermission('create', 'schedule-compliance-check')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Verificaciones offline sincronizadas correctamente.')
  @ApiBody({
    type: BatchSyncChecksDto,
    description:
      'Lista de verificaciones registradas localmente sin conexión a internet.',
  })
  @ApiCommonResponses({
    summary: 'Sincronizar verificaciones registradas offline',
    badRequestDescription: 'El formato del payload es inválido.',
  })
  @ApiOkResponse({
    description:
      'El endpoint siempre responde 200; la respuesta identifica cada offlineId persistido, en conflicto o fallido para que el cliente marque solo los realmente sincronizados.',
    schema: {
      type: 'object',
      required: [
        'status',
        'statusCode',
        'path',
        'message',
        'data',
        'timestamp',
      ],
      properties: {
        status: { type: 'boolean' },
        statusCode: { type: 'number' },
        path: { type: 'string' },
        message: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' },
        data: {
          type: 'object',
          required: [
            'synced',
            'conflicts',
            'skipped',
            'rejected',
            'conflictIds',
            'skippedIds',
            'rejectedIds',
          ],
          properties: {
            synced: {
              type: 'number',
              description:
                'Cantidad de verificaciones persistidas en el servidor.',
            },
            conflicts: {
              type: 'number',
              description: 'Claves únicas ya registradas por otro monitor.',
            },
            skipped: {
              type: 'number',
              description: 'Verificaciones que fallaron y deben reintentarse.',
            },
            rejected: {
              type: 'number',
              description:
                'Verificaciones con datos permanentes invÃ¡lidos que no deben reintentarse.',
            },
            conflictIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'offlineId de las verificaciones en conflicto.',
            },
            skippedIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'offlineId de las verificaciones que fallaron.',
            },
            rejectedIds: {
              type: 'array',
              items: { type: 'string' },
              description:
                'offlineId de verificaciones rechazadas por un error permanente.',
            },
          },
        },
      },
    },
  })
  batchSync(
    @GetCurrentUserId() monitorId: string,
    @Body() dto: BatchSyncChecksDto,
  ) {
    return this.monitorChecksService.batchSync(monitorId, dto);
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
  findAll(@GetCurrentUserId() userId: string, @Query() query: CheckFiltersDto) {
    return this.monitorChecksService.findAllWithFilters(userId, query);
  }
}
