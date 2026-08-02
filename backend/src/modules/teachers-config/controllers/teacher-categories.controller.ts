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
  LookupSource,
  RequirePermission,
} from 'src/common/decorators';
import { CreateTeacherCategoryDto } from '../dto/create-teacher-category.dto';
import { UpdateTeacherCategoryDto } from '../dto/update-teacher-category.dto';
import { TeacherCategoriesService } from '../services/teacher-categories.service';
import { ValidateIdPipe } from 'src/common/pipes';

@Controller('teacher-categories')
export class TeacherCategoriesController {
  constructor(
    private readonly teacherCategoriesService: TeacherCategoriesService,
  ) {}

  @Post()
  @RequirePermission('create', 'teacher-categories')
  @HttpCode(HttpStatus.CREATED) // Cambiado a CREATED (201)
  @ResponseMessage('Se ha creado una categoría de docente.')
  @ApiBody({
    type: CreateTeacherCategoryDto,
    description: 'Datos para crear una categoría de docente.',
  })
  @ApiCommonResponses({
    summary: 'Crear una categoría de docente',
    createdDescription: 'Categoría de docente creada exitosamente.',
    badRequestDescription:
      'Datos inválidos para crear la categoría de docente.',
    internalErrorDescription: 'Error interno al crear la categoría de docente.',
  })
  create(@Body() createTeacherCategoryDto: CreateTeacherCategoryDto) {
    return this.teacherCategoriesService.create(createTeacherCategoryDto);
  }

  @Get()
  @RequirePermission('read', 'teacher-categories')
  @LookupSource()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de categorías de docente.')
  @ApiCommonResponses({
    summary: 'Obtener todas las categorías de docente',
    okDescription: 'Listado de categorías de docente obtenido correctamente.',
    badRequestDescription:
      'Solicitud inválida al obtener las categorías de docente.',
    internalErrorDescription:
      'Error interno al obtener las categorías de docente.',
    notFoundDescription: 'No se encontraron categorías de docente.',
  })
  findAll() {
    return this.teacherCategoriesService.findAll();
  }

  @Get(':id')
  @RequirePermission('read', 'teacher-categories')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Información de una categoría de docente.')
  @ApiCommonResponses({
    summary: 'Obtener una categoría de docente por ID',
    okDescription: 'Categoría de docente obtenida correctamente.',
    badRequestDescription: 'ID inválido para obtener la categoría de docente.',
    internalErrorDescription:
      'Error interno al obtener la categoría de docente.',
    notFoundDescription: 'No se encontró la categoría de docente solicitada.',
  })
  findOne(@Param('id', ValidateIdPipe) id: string) {
    return this.teacherCategoriesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('update', 'teacher-categories')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha actualizado la categoría de docente.')
  @ApiBody({
    type: UpdateTeacherCategoryDto,
    description: 'Datos para actualizar una categoría de docente.',
  })
  @ApiCommonResponses({
    summary: 'Actualizar una categoría de docente por ID',
    okDescription: 'Categoría de docente actualizada correctamente.',
    badRequestDescription:
      'Datos inválidos para actualizar la categoría de docente.',
    internalErrorDescription:
      'Error interno al actualizar la categoría de docente.',
    notFoundDescription: 'No se encontró la categoría de docente a actualizar.',
  })
  update(
    @Param('id', ValidateIdPipe) id: string,
    @Body() updateTeacherCategoryDto: UpdateTeacherCategoryDto,
  ) {
    return this.teacherCategoriesService.update(id, updateTeacherCategoryDto);
  }

  @Delete(':id')
  @RequirePermission('delete', 'teacher-categories')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha eliminado la categoría de docente.')
  @ApiCommonResponses({
    summary: 'Eliminar una categoría de docente por ID',
    okDescription: 'Categoría de docente eliminada correctamente.',
    badRequestDescription: 'ID inválido para eliminar la categoría de docente.',
    internalErrorDescription:
      'Error interno al eliminar la categoría de docente.',
    notFoundDescription: 'No se encontró la categoría de docente a eliminar.',
  })
  remove(@Param('id', ValidateIdPipe) id: string) {
    return this.teacherCategoriesService.remove(id);
  }
}
