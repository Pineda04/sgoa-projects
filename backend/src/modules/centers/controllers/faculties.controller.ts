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
import { FacultiesService } from '../services/faculties.service';
import { CreateFacultyDto } from '../dto/create-faculty.dto';
import { UpdateFacultyDto } from '../dto/update-faculty.dto';
import { ValidateIdPipe } from 'src/common/pipes';
import {
  ApiCommonResponses,
  RequirePermission,
  ResponseMessage,
} from 'src/common/decorators';
import { ApiBody } from '@nestjs/swagger';

@Controller('faculties')
export class FacultiesController {
  constructor(private readonly facultiesService: FacultiesService) {}

  @Post()
  @RequirePermission('create', 'faculties')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Se ha creado una facultad.')
  @ApiBody({ type: CreateFacultyDto })
  @ApiCommonResponses({
    summary: 'Crear una facultad',
    createdDescription: 'Facultad creada exitosamente.',
    badRequestDescription: 'Datos inválidos para crear la facultad.',
    internalErrorDescription: 'Error interno al crear la facultad.',
  })
  create(@Body() createFacultyDto: CreateFacultyDto) {
    return this.facultiesService.create(createFacultyDto);
  }

  @Get()
  @RequirePermission('read', 'faculties')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de facultades.')
  @ApiCommonResponses({
    summary: 'Obtener todas las facultades',
    okDescription: 'Listado de facultades obtenido correctamente.',
  })
  findAll() {
    return this.facultiesService.findAll();
  }

  @Get(':id')
  @RequirePermission('read', 'faculties')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Información de la facultad.')
  @ApiCommonResponses({
    summary: 'Obtener una facultad por ID',
    okDescription: 'Facultad obtenida correctamente.',
    notFoundDescription: 'La facultad no existe.',
  })
  findOne(@Param('id', ValidateIdPipe) id: string) {
    return this.facultiesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('update', 'faculties')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha actualizado la facultad.')
  @ApiBody({ type: UpdateFacultyDto })
  @ApiCommonResponses({
    summary: 'Actualizar una facultad por ID',
    okDescription: 'Facultad actualizada correctamente.',
    badRequestDescription: 'Datos inválidos para la actualización.',
    notFoundDescription: 'La facultad no existe.',
  })
  update(
    @Param('id', ValidateIdPipe) id: string,
    @Body() updateFacultyDto: UpdateFacultyDto,
  ) {
    return this.facultiesService.update(id, updateFacultyDto);
  }

  @Delete(':id')
  @RequirePermission('delete', 'faculties')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha eliminado la facultad.')
  @ApiCommonResponses({
    summary: 'Eliminar una facultad por ID',
    okDescription: 'Facultad eliminada correctamente.',
    notFoundDescription: 'La facultad no existe.',
  })
  remove(@Param('id', ValidateIdPipe) id: string) {
    return this.facultiesService.remove(id);
  }
}
