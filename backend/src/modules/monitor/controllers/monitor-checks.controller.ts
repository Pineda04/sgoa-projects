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
import { ApiBody } from '@nestjs/swagger';
import {
  ApiCommonResponses,
  ApiPagination,
  GetCurrentUserId,
  ResponseMessage,
  Roles,
} from 'src/common/decorators';
import { EUserRole } from 'src/common/enums';
import { ValidateIdPipe } from 'src/common/pipes';
import { CheckFiltersDto, CreateCheckDto, UpdateCheckDto } from '../dto';
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

  @Patch(':id')
  @Roles(EUserRole.MONITOR)
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
