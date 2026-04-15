import { ApiCommonResponses, ResponseMessage } from 'src/common/decorators';
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
import { CreatePositionDto } from '../dto/create-position.dto';
import { UpdatePositionDto } from '../dto/update-position.dto';
import { PositionsService } from '../services/positions.service';
import { Roles } from 'src/common/decorators';
import { EUserRole } from 'src/common/enums';
import { ValidateIdPipe } from 'src/common/pipes';
import { ApiBody } from '@nestjs/swagger';

@Controller('positions')
@Roles(EUserRole.ADMIN, EUserRole.DIRECCION, EUserRole.RRHH)
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Cargo creado exitosamente.')
  @ApiBody({
    type: CreatePositionDto,
    description: 'Datos para crear un cargo',
    required: true,
  })
  @ApiCommonResponses({
    summary: 'Crear cargo',
    createdDescription: 'Cargo creado correctamente.',
    notFoundDescription: 'No se encontró el recurso solicitado.',
  })
  create(@Body() createPositionDto: CreatePositionDto) {
    return this.positionsService.create(createPositionDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de cargos obtenido correctamente.')
  @ApiCommonResponses({
    summary: 'Listar cargos',
    okDescription: 'Listado de cargos obtenido.',
    notFoundDescription: 'No se encontraron cargos.',
  })
  findAll() {
    return this.positionsService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Cargo obtenido correctamente.')
  @ApiCommonResponses({
    summary: 'Obtener cargo por ID',
    okDescription: 'Cargo obtenido correctamente.',
    notFoundDescription: 'No se encontró el cargo solicitado.',
  })
  findOne(@Param('id', ValidateIdPipe) id: string) {
    return this.positionsService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Cargo actualizado correctamente.')
  @ApiBody({
    type: UpdatePositionDto,
    description: 'Datos para actualizar un cargo',
    required: true,
  })
  @ApiCommonResponses({
    summary: 'Actualizar cargo',
    okDescription: 'Cargo actualizado correctamente.',
    notFoundDescription: 'No se encontró el cargo solicitado.',
  })
  update(
    @Param('id', ValidateIdPipe) id: string,
    @Body() updatePositionDto: UpdatePositionDto,
  ) {
    return this.positionsService.update(id, updatePositionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Cargo eliminado correctamente.')
  @ApiCommonResponses({
    summary: 'Eliminar cargo',
    okDescription: 'Cargo eliminado correctamente.',
    notFoundDescription: 'No se encontró el cargo a eliminar.',
  })
  remove(@Param('id', ValidateIdPipe) id: string) {
    return this.positionsService.remove(id);
  }
}
