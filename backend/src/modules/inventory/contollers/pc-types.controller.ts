import { ApiBody } from '@nestjs/swagger';
import {
  ApiCommonResponses,
  RequirePermission,
  ResponseMessage,
} from 'src/common/decorators';
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
import { ValidateIdPipe } from 'src/common/pipes';
import { PcTypesService } from '../services/pc-types.service';
import { CreatePcTypeDto, UpdatePcTypeDto } from '../dto';

@Controller('pc-types')
export class PcTypesController {
  constructor(private readonly pcTypesService: PcTypesService) {}

  @Post()
  @RequirePermission('create', 'pc-equipments')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Tipo de PC creado exitosamente.')
  @ApiBody({
    type: CreatePcTypeDto,
    description: 'Datos para crear un tipo de PC',
    required: true,
  })
  @ApiCommonResponses({
    summary: 'Crear tipo de PC',
    createdDescription: 'Tipo de PC creado correctamente.',
  })
  create(@Body() createPcTypeDto: CreatePcTypeDto) {
    return this.pcTypesService.create(createPcTypeDto);
  }

  @Get()
  @RequirePermission('read', 'pc-equipments')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de tipos de PC obtenido correctamente.')
  @ApiCommonResponses({
    summary: 'Listar tipos de PC',
    okDescription: 'Listado de tipos de PC obtenido.',
    notFoundDescription: 'No se encontraron tipos de PC.',
  })
  findAll() {
    return this.pcTypesService.findAll();
  }

  @Get(':id')
  @RequirePermission('read', 'pc-equipments')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Tipo de PC obtenido correctamente.')
  @ApiCommonResponses({
    summary: 'Obtener tipo de PC por ID',
    okDescription: 'Tipo de PC obtenido.',
    notFoundDescription: 'No se encontró el tipo de PC solicitado.',
  })
  findOne(@Param('id', ValidateIdPipe) id: string) {
    return this.pcTypesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('update', 'pc-equipments')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Tipo de PC actualizado correctamente.')
  @ApiBody({
    type: UpdatePcTypeDto,
    description: 'Datos para actualizar un tipo de PC',
    required: true,
  })
  @ApiCommonResponses({
    summary: 'Actualizar tipo de PC',
    okDescription: 'Tipo de PC actualizado correctamente.',
    notFoundDescription: 'No se encontró el tipo de PC solicitado.',
  })
  update(
    @Param('id', ValidateIdPipe) id: string,
    @Body() updatePcTypeDto: UpdatePcTypeDto,
  ) {
    return this.pcTypesService.update(id, updatePcTypeDto);
  }

  @Delete(':id')
  @RequirePermission('delete', 'pc-equipments')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Tipo de PC eliminado correctamente.')
  @ApiCommonResponses({
    summary: 'Eliminar tipo de PC',
    okDescription: 'Tipo de PC eliminado correctamente.',
    notFoundDescription: 'No se encontró el tipo de PC a eliminar.',
  })
  remove(@Param('id', ValidateIdPipe) id: string) {
    return this.pcTypesService.remove(id);
  }
}
