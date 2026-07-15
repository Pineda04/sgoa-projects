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
  RequirePermission,
  ResponseMessage,
} from 'src/common/decorators';
import { ValidateIdPipe } from 'src/common/pipes';
import { CreateAudioEquipmentDto, UpdateAudioEquipmentDto } from '../dto';
import { AudioEquipmentService } from '../services/audio-equipment.service';
import { ApiBody } from '@nestjs/swagger';

@Controller('audio-equipments')
export class AudioEquipmentController {
  constructor(private readonly audioEquipmentService: AudioEquipmentService) {}

  @Post()
  @RequirePermission('create', 'audio-equipments')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Se ha creado un equipo de audio.')
  @ApiBody({ type: CreateAudioEquipmentDto })
  @ApiCommonResponses({
    summary: 'Crear un equipo de audio',
    createdDescription: 'Equipo de audio creado exitosamente.',
    badRequestDescription: 'Datos inválidos para crear el equipo de audio.',
    internalErrorDescription: 'Error interno al crear el equipo de audio.',
  })
  create(@Body() createAudioEquipmentDto: CreateAudioEquipmentDto) {
    return this.audioEquipmentService.create(createAudioEquipmentDto);
  }

  @Get()
  @RequirePermission('read', 'audio-equipments')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de equipos de audio.')
  @ApiCommonResponses({
    summary: 'Obtener todos los equipos de audio',
    okDescription: 'Listado de equipos de audio obtenido correctamente.',
  })
  findAll() {
    return this.audioEquipmentService.findAll();
  }

  @Get(':id')
  @RequirePermission('read', 'audio-equipments')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Información del equipo de audio.')
  @ApiCommonResponses({
    summary: 'Obtener un equipo de audio por ID',
    okDescription: 'Equipo de audio obtenido correctamente.',
    notFoundDescription: 'El equipo de audio no existe.',
  })
  findOne(@Param('id', ValidateIdPipe) id: string) {
    return this.audioEquipmentService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('update', 'audio-equipments')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha actualizado el equipo de audio.')
  @ApiBody({ type: UpdateAudioEquipmentDto })
  @ApiCommonResponses({
    summary: 'Actualizar un equipo de audio por ID',
    okDescription: 'Equipo de audio actualizado correctamente.',
    badRequestDescription: 'Datos inválidos para la actualización.',
    notFoundDescription: 'El equipo de audio no existe.',
  })
  update(
    @Param('id', ValidateIdPipe) id: string,
    @Body() updateAudioEquipmentDto: UpdateAudioEquipmentDto,
  ) {
    return this.audioEquipmentService.update(id, updateAudioEquipmentDto);
  }

  @Delete(':id')
  @RequirePermission('delete', 'audio-equipments')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha eliminado el equipo de audio.')
  @ApiCommonResponses({
    summary: 'Eliminar un equipo de audio por ID',
    okDescription: 'Equipo de audio eliminado correctamente.',
    notFoundDescription: 'El equipo de audio no existe.',
  })
  remove(@Param('id', ValidateIdPipe) id: string) {
    return this.audioEquipmentService.remove(id);
  }
}
