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
import { ApiCommonResponses, ResponseMessage } from 'src/common/decorators';
import { Roles } from 'src/common/decorators';
import { EUserRole } from 'src/common/enums';
import { ValidateIdPipe } from 'src/common/pipes';
import { CreateMonitorSizeDto, UpdateMonitorSizeDto } from '../dto';
import { MonitorSizesService } from '../services/monitor-sizes.service';

@Controller('monitor-sizes')
@Roles(
  EUserRole.ADMIN,
  EUserRole.DIRECCION,
  EUserRole.RRHH,
  EUserRole.COORDINADOR_AREA,
)
export class MonitorSizesController {
  constructor(private readonly monitorSizesService: MonitorSizesService) {}

  @Post()
  @Roles(EUserRole.ADMIN, EUserRole.DIRECCION, EUserRole.RRHH)
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Tamaño de monitor creado exitosamente.')
  @ApiBody({
    type: CreateMonitorSizeDto,
    description: 'Datos para crear un tamaño de monitor',
    required: true,
  })
  @ApiCommonResponses({
    summary: 'Crear tamaño de monitor',
    createdDescription: 'Tamaño de monitor creado correctamente.',
  })
  create(@Body() createMonitorSizeDto: CreateMonitorSizeDto) {
    return this.monitorSizesService.create(createMonitorSizeDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de tamaños de monitor.')
  @ApiCommonResponses({
    summary: 'Listar tamaños de monitor',
    okDescription: 'Listado de tamaños de monitor.',
  })
  findAll() {
    return this.monitorSizesService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Tamaño de monitor obtenido.')
  @ApiCommonResponses({
    summary: 'Obtener tamaño de monitor',
    okDescription: 'Tamaño de monitor obtenido.',
    notFoundDescription: 'No se encontró el tamaño de monitor solicitado.',
  })
  findOne(@Param('id', ValidateIdPipe) id: string) {
    return this.monitorSizesService.findOne(id);
  }

  @Patch(':id')
  @Roles(EUserRole.ADMIN, EUserRole.DIRECCION, EUserRole.RRHH)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Tamaño de monitor actualizado.')
  @ApiBody({
    type: UpdateMonitorSizeDto,
    description: 'Datos para actualizar un tamaño de monitor',
    required: true,
  })
  @ApiCommonResponses({
    summary: 'Actualizar tamaño de monitor',
    okDescription: 'Tamaño de monitor actualizado.',
    notFoundDescription: 'No se encontró el tamaño de monitor solicitado.',
  })
  update(
    @Param('id', ValidateIdPipe) id: string,
    @Body() updateMonitorSizeDto: UpdateMonitorSizeDto,
  ) {
    return this.monitorSizesService.update(id, updateMonitorSizeDto);
  }

  @Delete(':id')
  @Roles(EUserRole.ADMIN, EUserRole.DIRECCION, EUserRole.RRHH)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Tamaño de monitor eliminado.')
  @ApiCommonResponses({
    summary: 'Eliminar tamaño de monitor',
    okDescription: 'Tamaño de monitor eliminado.',
    notFoundDescription: 'No se encontró el tamaño de monitor solicitado.',
  })
  remove(@Param('id', ValidateIdPipe) id: string) {
    return this.monitorSizesService.remove(id);
  }
}
