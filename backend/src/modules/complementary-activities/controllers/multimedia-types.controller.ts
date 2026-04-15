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
import { ApiBody, ApiParam } from '@nestjs/swagger';
import {
  Roles,
  ResponseMessage,
  ApiCommonResponses,
} from 'src/common/decorators';
import { EUserRole } from 'src/common/enums';
import { ValidateIdPipe } from 'src/common/pipes';
import { UpdateMultimediaTypeDto } from '../dto/update-multimedia-type.dto';
import { MultimediaTypesService } from '../services/multimedia-types.service';
import { CreateMultimediaTypeDto } from '../dto';

@Controller('multimedia-types')
export class MultimediaTypesController {
  constructor(
    private readonly multimediaTypesService: MultimediaTypesService,
  ) {}

  @Post()
  @Roles(EUserRole.ADMIN, EUserRole.DIRECCION, EUserRole.RRHH)
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Se ha creado un tipo de multimedia.')
  @ApiBody({
    type: CreateMultimediaTypeDto,
    description: 'Datos necesarios para crear un tipo de multimedia.',
  })
  @ApiCommonResponses({
    summary: 'Crear un tipo de multimedia',
    createdDescription: 'Tipo de multimedia creado correctamente.',
    badRequestDescription: 'Datos inválidos para la creación.',
  })
  create(@Body() createMultimediaTypeDto: CreateMultimediaTypeDto) {
    return this.multimediaTypesService.create(createMultimediaTypeDto);
  }

  @Get()
  @Roles(EUserRole.ADMIN, EUserRole.DIRECCION, EUserRole.RRHH)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de tipos de multimediaes.')
  @ApiCommonResponses({
    summary: 'Obtener todos los tipos de multimediaes',
    okDescription: 'Lista de tipos de multimedia obtenida correctamente.',
  })
  findAll() {
    return this.multimediaTypesService.findAll();
  }

  @Get(':id')
  @Roles(
    EUserRole.ADMIN,
    EUserRole.DIRECCION,
    EUserRole.RRHH,
    EUserRole.COORDINADOR_AREA,
    EUserRole.DOCENTE,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('La información del tipo de multimedia.')
  @ApiParam({
    name: 'id',
    description: 'ID del tipo de multimedia a obtener',
    type: String,
    format: 'uuid',
  })
  @ApiCommonResponses({
    summary: 'Obtener un tipo de multimedia por ID',
    okDescription: 'Tipo de multimedia obtenido correctamente.',
    notFoundDescription: 'El tipo de multimedia no existe.',
  })
  findOne(@Param('id', ValidateIdPipe) id: string) {
    return this.multimediaTypesService.findOne(id);
  }

  @Patch(':id')
  @Roles(EUserRole.ADMIN, EUserRole.DIRECCION, EUserRole.RRHH)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha actualizado el tipo de multimedia.')
  @ApiParam({
    name: 'id',
    description: 'ID del tipo de multimedia a actualizar',
    type: String,
    format: 'uuid',
  })
  @ApiBody({ type: UpdateMultimediaTypeDto })
  @ApiCommonResponses({
    summary: 'Actualizar un tipo de multimedia por ID',
    okDescription: 'Tipo de multimedia actualizado correctamente.',
    badRequestDescription: 'Datos inválidos para la actualización.',
    notFoundDescription: 'El tipo de multimedia no existe.',
  })
  update(
    @Param('id', ValidateIdPipe) id: string,
    @Body() updateMultimediaTypeDto: UpdateMultimediaTypeDto,
  ) {
    return this.multimediaTypesService.update(id, updateMultimediaTypeDto);
  }

  @Delete(':id')
  @Roles(EUserRole.ADMIN, EUserRole.DIRECCION, EUserRole.RRHH)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha eliminado un tipo de multimedia.')
  @ApiParam({
    name: 'id',
    description: 'ID del tipo de multimedia a eliminar',
    type: String,
    format: 'uuid',
  })
  @ApiCommonResponses({
    summary: 'Eliminar un tipo de multimedia por ID',
    okDescription: 'Tipo de multimedia eliminado correctamente.',
    notFoundDescription: 'El tipo de multimedia no existe.',
  })
  remove(@Param('id', ValidateIdPipe) id: string) {
    return this.multimediaTypesService.remove(id);
  }
}
