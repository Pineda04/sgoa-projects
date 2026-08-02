import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import {
  ApiCommonResponses,
  LookupSource,
  RequirePermission,
  ResponseMessage,
} from 'src/common/decorators';
import { ValidateIdPipe } from 'src/common/pipes';
import { CreateMonitorTypeDto, UpdateMonitorTypeDto } from '../dto';
import { MonitorTypesService } from '../services/monitor-types.service';

@Controller('monitor-types')
export class MonitorTypesController {
  constructor(private readonly monitorTypesService: MonitorTypesService) {}

  @Post()
  @RequirePermission('create', 'monitor-types')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Tipo de monitor creado exitosamente.')
  @ApiBody({
    type: CreateMonitorTypeDto,
    description: 'Datos para crear un tipo de monitor',
    required: true,
  })
  @ApiCommonResponses({
    summary: 'Crear tipo de monitor',
    createdDescription: 'Tipo de monitor creado correctamente.',
  })
  create(@Body() createMonitorTypeDto: CreateMonitorTypeDto) {
    return this.monitorTypesService.create(createMonitorTypeDto);
  }

  @Get()
  @RequirePermission('read', 'monitor-types')
  @LookupSource()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de tipos de monitor.')
  @ApiCommonResponses({
    summary: 'Listar tipos de monitor',
    okDescription: 'Listado de tipos de monitor.',
  })
  findAll() {
    return this.monitorTypesService.findAll();
  }

  @Get(':id')
  @RequirePermission('read', 'monitor-types')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Tipo de monitor obtenido.')
  @ApiCommonResponses({
    summary: 'Obtener tipo de monitor',
    okDescription: 'Tipo de monitor obtenido.',
    notFoundDescription: 'No se encontró el tipo de monitor solicitado.',
  })
  findOne(@Param('id', ValidateIdPipe) id: string) {
    return this.monitorTypesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('update', 'monitor-types')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Tipo de monitor actualizado.')
  @ApiBody({
    type: UpdateMonitorTypeDto,
    description: 'Datos para actualizar un tipo de monitor',
    required: true,
  })
  @ApiCommonResponses({
    summary: 'Actualizar tipo de monitor',
    okDescription: 'Tipo de monitor actualizado.',
    notFoundDescription: 'No se encontró el tipo de monitor solicitado.',
  })
  update(
    @Param('id', ValidateIdPipe) id: string,
    @Body() updateMonitorTypeDto: UpdateMonitorTypeDto,
  ) {
    return this.monitorTypesService.update(id, updateMonitorTypeDto);
  }

  @Delete(':id')
  @RequirePermission('delete', 'monitor-types')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Tipo de monitor eliminado.')
  @ApiCommonResponses({
    summary: 'Eliminar tipo de monitor',
    okDescription: 'Tipo de monitor eliminado.',
    notFoundDescription: 'No se encontró el tipo de monitor solicitado.',
  })
  remove(@Param('id', ValidateIdPipe) id: string) {
    return this.monitorTypesService.remove(id);
  }
}
