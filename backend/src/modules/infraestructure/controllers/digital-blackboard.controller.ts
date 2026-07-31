import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import {
  ApiCommonResponses,
  ResponseMessage,
  Roles,
} from 'src/common/decorators';
import { EUserRole } from 'src/common/enums';
import { ValidateIdPipe } from 'src/common/pipes';
import { DigitalBlackboardService } from '../services/digital-blackboard.service';
import { CreateDigitalBlackboardDto } from '../dto/create-digital-blackboard.dto';
import { UpdateDigitalBlackboardDto } from '../dto/update-digital-blackboard.dto';

@Controller('digital-blackboards')
@Roles(
  EUserRole.ADMIN,
  EUserRole.DIRECCION,
  EUserRole.RRHH,
  EUserRole.COORDINADOR_AREA,
  EUserRole.MONITOR,
)
export class DigitalBlackboardController {
  constructor(
    private readonly digitalBlackboardService: DigitalBlackboardService,
  ) {}

  @Get()
  @Roles(
    EUserRole.ADMIN,
    EUserRole.DIRECCION,
    EUserRole.RRHH,
    EUserRole.COORDINADOR_AREA,
    EUserRole.DOCENTE,
    EUserRole.MONITOR,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de pizarras digitales.')
  @ApiCommonResponses({
    summary: 'Obtener todas las pizarras digitales',
    okDescription: 'Listado de pizarras digitales obtenido correctamente.',
  })
  findAll() {
    return this.digitalBlackboardService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha encontrado la pizarra digital.')
  @ApiCommonResponses({
    summary: 'Obtener una pizarra digital por ID',
    okDescription: 'Pizarra digital obtenida correctamente.',
    notFoundDescription: 'La pizarra digital no existe.',
  })
  findOne(@Param('id', ValidateIdPipe) id: string) {
    return this.digitalBlackboardService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Se ha creado la pizarra digital.')
  @ApiCommonResponses({
    summary: 'Crear una pizarra digital',
    okDescription: 'Pizarra digital creada correctamente.',
  })
  create(@Body() createDigitalBlackboardDto: CreateDigitalBlackboardDto) {
    return this.digitalBlackboardService.create(createDigitalBlackboardDto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha actualizado la pizarra digital.')
  @ApiCommonResponses({
    summary: 'Actualizar una pizarra digital por ID',
    okDescription: 'Pizarra digital actualizada correctamente.',
    notFoundDescription: 'La pizarra digital no existe.',
  })
  update(@Param('id', ValidateIdPipe) id: string, @Body() updateDigitalBlackboardDto: UpdateDigitalBlackboardDto) {
    return this.digitalBlackboardService.update(id, updateDigitalBlackboardDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha eliminado la pizarra digital.')
  @ApiCommonResponses({
    summary: 'Eliminar una pizarra digital por ID',
    okDescription: 'Pizarra digital eliminada correctamente.',
    notFoundDescription: 'La pizarra digital no existe.',
  })
  remove(@Param('id', ValidateIdPipe) id: string) {
    return this.digitalBlackboardService.remove(id);
  }
}
