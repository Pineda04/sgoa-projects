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
import { CreateRoomTypeDto, UpdateRoomTypeDto } from '../dto';
import { RoomTypeService } from '../services/room-type.service';
import { ApiBody } from '@nestjs/swagger';

@Controller('room-types')
export class RoomTypeController {
  constructor(private readonly roomTypeService: RoomTypeService) {}

  @Post()
  @RequirePermission('create', 'classrooms')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Se ha creado un tipo de aula.')
  @ApiBody({ type: CreateRoomTypeDto })
  @ApiCommonResponses({
    summary: 'Crear un tipo de aula',
    createdDescription: 'Tipo de aula creado exitosamente.',
    badRequestDescription: 'Datos inválidos para crear el tipo de aula.',
    internalErrorDescription: 'Error interno al crear el tipo de aula.',
  })
  create(@Body() createRoomTypeDto: CreateRoomTypeDto) {
    return this.roomTypeService.create(createRoomTypeDto);
  }

  @Get()
  @RequirePermission('read', 'classrooms')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de tipos de aula.')
  @ApiCommonResponses({
    summary: 'Obtener todos los tipos de aula',
    okDescription: 'Listado de tipos de aula obtenido correctamente.',
  })
  findAll() {
    return this.roomTypeService.findAll();
  }

  @Get(':id')
  @RequirePermission('read', 'classrooms')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Información del tipo de aula.')
  @ApiCommonResponses({
    summary: 'Obtener un tipo de aula por ID',
    okDescription: 'Tipo de aula obtenido correctamente.',
    notFoundDescription: 'El tipo de aula no existe.',
  })
  findOne(@Param('id', ValidateIdPipe) id: string) {
    return this.roomTypeService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('update', 'classrooms')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha actualizado el tipo de aula.')
  @ApiBody({ type: UpdateRoomTypeDto })
  @ApiCommonResponses({
    summary: 'Actualizar un tipo de aula por ID',
    okDescription: 'Tipo de aula actualizado correctamente.',
    badRequestDescription: 'Datos inválidos para la actualización.',
    notFoundDescription: 'El tipo de aula no existe.',
  })
  update(
    @Param('id', ValidateIdPipe) id: string,
    @Body() updateRoomTypeDto: UpdateRoomTypeDto,
  ) {
    return this.roomTypeService.update(id, updateRoomTypeDto);
  }

  @Delete(':id')
  @RequirePermission('delete', 'classrooms')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha eliminado el tipo de aula.')
  @ApiCommonResponses({
    summary: 'Eliminar un tipo de aula por ID',
    okDescription: 'Tipo de aula eliminado correctamente.',
    notFoundDescription: 'El tipo de aula no existe.',
  })
  remove(@Param('id', ValidateIdPipe) id: string) {
    return this.roomTypeService.remove(id);
  }
}
