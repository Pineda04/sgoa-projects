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
import {
  ApiCommonResponses,
  LookupSource,
  RequirePermission,
  ResponseMessage,
} from 'src/common/decorators';
import { ValidateIdPipe } from 'src/common/pipes';
import { ConnectivityService } from '../services/connectivity.service';
import { CreateConnectivityDto } from '../dto/create-connectivity.dto';
import { UpdateConnectivityDto } from '../dto/update-connectivity.dto';
import { ApiBody } from '@nestjs/swagger';

@Controller('connectivities')
export class ConnectivityController {
  constructor(private readonly connectivityService: ConnectivityService) {}

  @Post()
  @RequirePermission('create', 'connectivities')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Se ha creado una conectividad.')
  @ApiBody({ type: CreateConnectivityDto })
  @ApiCommonResponses({
    summary: 'Crear una conectividad',
    createdDescription: 'Conectividad creada exitosamente.',
    badRequestDescription: 'Datos inválidos para crear la conectividad.',
    internalErrorDescription: 'Error interno al crear la conectividad.',
  })
  create(@Body() createConnectivityDto: CreateConnectivityDto) {
    return this.connectivityService.create(createConnectivityDto);
  }

  @Get()
  @RequirePermission('read', 'connectivities')
  @LookupSource()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de conectividades.')
  @ApiCommonResponses({
    summary: 'Obtener todas las conectividades',
    okDescription: 'Listado de conectividades obtenido correctamente.',
  })
  findAll() {
    return this.connectivityService.findAll();
  }

  @Get(':id')
  @RequirePermission('read', 'connectivities')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Información de la conectividad.')
  @ApiCommonResponses({
    summary: 'Obtener una conectividad por ID',
    okDescription: 'Conectividad obtenida correctamente.',
    notFoundDescription: 'La conectividad no existe.',
  })
  findOne(@Param('id', ValidateIdPipe) id: string) {
    return this.connectivityService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('update', 'connectivities')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha actualizado la conectividad.')
  @ApiBody({ type: UpdateConnectivityDto })
  @ApiCommonResponses({
    summary: 'Actualizar una conectividad por ID',
    okDescription: 'Conectividad actualizada correctamente.',
    badRequestDescription: 'Datos inválidos para la actualización.',
    notFoundDescription: 'La conectividad no existe.',
  })
  update(
    @Param('id', ValidateIdPipe) id: string,
    @Body() updateConnectivityDto: UpdateConnectivityDto,
  ) {
    return this.connectivityService.update(id, updateConnectivityDto);
  }

  @Delete(':id')
  @RequirePermission('delete', 'connectivities')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha eliminado la conectividad.')
  @ApiCommonResponses({
    summary: 'Eliminar una conectividad por ID',
    okDescription: 'Conectividad eliminada correctamente.',
    notFoundDescription: 'La conectividad no existe.',
  })
  remove(@Param('id', ValidateIdPipe) id: string) {
    return this.connectivityService.remove(id);
  }
}
