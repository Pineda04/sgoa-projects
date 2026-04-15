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
  ResponseMessage,
  Roles,
} from 'src/common/decorators';
import { EUserRole } from 'src/common/enums';
import { ApiBody } from '@nestjs/swagger';

@Controller('faculties')
@Roles(
  EUserRole.ADMIN,
  EUserRole.DIRECCION,
  EUserRole.RRHH,
  EUserRole.COORDINADOR_AREA,
)
export class FacultiesController {
  constructor(private readonly facultiesService: FacultiesService) {}

  @Post()
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
