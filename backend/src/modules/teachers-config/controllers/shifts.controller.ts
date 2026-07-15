import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import {
  ResponseMessage,
  ApiCommonResponses,
  RequirePermission,
} from 'src/common/decorators';
import { CreateShiftDto } from '../dto/create-shift.dto';
import { UpdateShiftDto } from '../dto/update-shift.dto';
import { ShiftsService } from '../services/shifts.service';
import { ValidateIdPipe } from 'src/common/pipes';

@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Post()
  @RequirePermission('create', 'users')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Se ha creado un turno.')
  @ApiBody({ type: CreateShiftDto, description: 'Datos para crear un turno.' })
  @ApiCommonResponses({
    summary: 'Crear un turno',
    createdDescription: 'Turno creado exitosamente.',
    badRequestDescription: 'Datos inválidos para crear el turno.',
    internalErrorDescription: 'Error interno al crear el turno.',
  })
  create(@Body() createShiftDto: CreateShiftDto) {
    return this.shiftsService.create(createShiftDto);
  }

  @Get()
  @RequirePermission('read', 'users')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de turnos.')
  @ApiCommonResponses({
    summary: 'Obtener todos los turnos',
    okDescription: 'Listado de turnos obtenido correctamente.',
    badRequestDescription: 'Solicitud inválida al obtener los turnos.',
    internalErrorDescription: 'Error interno al obtener los turnos.',
    notFoundDescription: 'No se encontraron turnos.',
  })
  findAll() {
    return this.shiftsService.findAll();
  }

  @Get(':id')
  @RequirePermission('read', 'users')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Información de un turno.')
  @ApiCommonResponses({
    summary: 'Obtener un turno por ID',
    okDescription: 'Turno obtenido correctamente.',
    badRequestDescription: 'ID inválido para obtener el turno.',
    internalErrorDescription: 'Error interno al obtener el turno.',
    notFoundDescription: 'No se encontró el turno solicitado.',
  })
  findOne(@Param('id', ValidateIdPipe) id: string) {
    return this.shiftsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('update', 'users')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha actualizado el turno.')
  @ApiBody({
    type: UpdateShiftDto,
    description: 'Datos para actualizar un turno.',
  })
  @ApiCommonResponses({
    summary: 'Actualizar un turno por ID',
    okDescription: 'Turno actualizado correctamente.',
    badRequestDescription: 'Datos inválidos para actualizar el turno.',
    internalErrorDescription: 'Error interno al actualizar el turno.',
    notFoundDescription: 'No se encontró el turno a actualizar.',
  })
  update(
    @Param('id', ValidateIdPipe) id: string,
    @Body() updateShiftDto: UpdateShiftDto,
  ) {
    return this.shiftsService.update(id, updateShiftDto);
  }

  @Delete(':id')
  @RequirePermission('delete', 'users')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha eliminado el turno.')
  @ApiCommonResponses({
    summary: 'Eliminar un turno por ID',
    okDescription: 'Turno eliminado correctamente.',
    badRequestDescription: 'ID inválido para eliminar el turno.',
    internalErrorDescription: 'Error interno al eliminar el turno.',
    notFoundDescription: 'No se encontró el turno a eliminar.',
  })
  remove(@Param('id', ValidateIdPipe) id: string) {
    return this.shiftsService.remove(id);
  }
}
