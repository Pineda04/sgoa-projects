import { ApiBody } from '@nestjs/swagger';
import { ApiCommonResponses } from 'src/common/decorators';
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
  Query,
} from '@nestjs/common';
import { ApiPagination, ResponseMessage, Roles } from 'src/common/decorators';
import { EUserRole } from 'src/common/enums';
import { ValidateIdPipe } from 'src/common/pipes';
import { PcEquipmentsService } from '../services/pc-equipments.service';
import { CreatePcEquipmentDto, UpdatePcEquipmentDto } from '../dto';
import { QueryPaginationDto } from 'src/common/dto';

@Controller('pc-equipments')
@Roles(
  EUserRole.ADMIN,
  EUserRole.DIRECCION,
  EUserRole.RRHH,
  EUserRole.COORDINADOR_AREA,
)
export class PcEquipmentsController {
  constructor(private readonly pcEquipmentsService: PcEquipmentsService) {}

  @Post()
  @Roles(EUserRole.ADMIN, EUserRole.DIRECCION, EUserRole.RRHH)
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Equipo de computo creado exitosamente.')
  @ApiBody({
    type: CreatePcEquipmentDto,
    description: 'Datos para crear un equipo de computo',
    required: true,
  })
  @ApiCommonResponses({
    summary: 'Crear equipo de computo',
    createdDescription: 'Equipo de computo creado correctamente.',
  })
  create(@Body() createPcEquipmentDto: CreatePcEquipmentDto) {
    return this.pcEquipmentsService.create(createPcEquipmentDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de equipos de computo.')
  @ApiCommonResponses({
    summary: 'Listar equipos de computo',
    okDescription: 'Listado de equipos de computo obtenido.',
  })
  @ApiPagination({
    summary: 'Listar equipos de computo paginados',
    description: 'Devuelve una lista paginada de equipos de computo.',
  })
  findAll(@Query() query: QueryPaginationDto) {
    return this.pcEquipmentsService.findAllWithPagination(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Equipo de computo obtenido.')
  @ApiCommonResponses({
    summary: 'Obtener equipo de computo por ID',
    okDescription: 'Equipo de computo obtenido.',
    notFoundDescription: 'No se encontró el equipo de computo solicitado.',
  })
  findOne(@Param('id', ValidateIdPipe) id: string) {
    return this.pcEquipmentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(EUserRole.ADMIN, EUserRole.DIRECCION, EUserRole.RRHH)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Equipo de computo actualizado.')
  @ApiBody({
    type: UpdatePcEquipmentDto,
    description: 'Datos para actualizar un equipo de computo',
    required: true,
  })
  @ApiCommonResponses({
    summary: 'Actualizar equipo de computo',
    okDescription: 'Equipo de computo actualizado.',
    notFoundDescription: 'No se encontró el equipo de computo solicitado.',
  })
  update(
    @Param('id', ValidateIdPipe) id: string,
    @Body() updatePcEquipmentDto: UpdatePcEquipmentDto,
  ) {
    return this.pcEquipmentsService.update(id, updatePcEquipmentDto);
  }

  @Delete(':id')
  @Roles(EUserRole.ADMIN, EUserRole.DIRECCION, EUserRole.RRHH)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Equipo de computo eliminado.')
  @ApiCommonResponses({
    summary: 'Eliminar equipo de computo',
    okDescription: 'Equipo de computo eliminado.',
    notFoundDescription: 'No se encontró el equipo de computo a eliminar.',
  })
  remove(@Param('id', ValidateIdPipe) id: string) {
    return this.pcEquipmentsService.remove(id);
  }
}
