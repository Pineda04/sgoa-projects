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
  Query,
} from '@nestjs/common';
import { CreateCourseClassroomDto, UpdateCourseClassroomDto } from '../dto';
import { CourseClassroomsService } from '../services/course-classrooms.service';
import {
  ApiPagination,
  GetCurrentUserId,
  ResponseMessage,
  Roles,
} from 'src/common/decorators';
import { EUserRole } from 'src/common/enums';
import { ValidateIdPipe } from 'src/common/pipes';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import { ApiBody } from '@nestjs/swagger';
import { ApiCommonResponses } from 'src/common/decorators/api-response.decorator';
import { QueryPaginationDto } from 'src/common/dto';

@Controller('course-classrooms')
export class CourseClassroomsController {
  constructor(
    private readonly courseClassroomsService: CourseClassroomsService,
  ) {}

  @Post()
  @Roles(
    EUserRole.ADMIN,
    EUserRole.DIRECCION,
    EUserRole.RRHH,
    EUserRole.COORDINADOR_AREA,
  )
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Se ha creado una sección de asignatura.')
  @ApiBody({
    type: CreateCourseClassroomDto,
    description: 'Datos necesarios para crear una sección de asignatura.',
  })
  @ApiCommonResponses({
    summary: 'Crear una sección de asignatura',
    createdDescription: 'Se ha creado una sección de asignatura.',
    badRequestDescription: 'Datos inválidos para la creación.',
  })
  create(@Body() createCourseClassroomDto: CreateCourseClassroomDto) {
    return this.courseClassroomsService.create(createCourseClassroomDto);
  }

  @Get()
  @Roles(
    EUserRole.ADMIN,
    EUserRole.DIRECCION,
    EUserRole.RRHH,
    EUserRole.COORDINADOR_AREA,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de secciones de asignatura.')
  @ApiCommonResponses({
    summary: 'Obtener todas las secciones de asignatura',
    okDescription: 'Listado de secciones de asignatura obtenido correctamente.',
  })
  @ApiPagination({
    summary: 'Obtener todas las secciones de asignatura, en una lista paginada',
  })
  findAll(@Query() query: QueryPaginationDto) {
    return this.courseClassroomsService.findAllWithPagination(query);
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
  @ResponseMessage('La información de la sección de asignatura.')
  @ApiParam({
    name: 'id',
    description: 'ID de la sección de asignatura a obtener',
    type: String,
    format: 'uuid',
  })
  @ApiCommonResponses({
    summary: 'Obtener una sección de asignatura por ID',
    okDescription: 'Sección de asignatura obtenida correctamente.',
    notFoundDescription: 'La sección de asignatura no existe.',
  })
  findOne(@Param('id', ValidateIdPipe) id: string) {
    return this.courseClassroomsService.findOne(id);
  }

  @Get('my/current-period')
  @Roles(
    EUserRole.ADMIN,
    EUserRole.DIRECCION,
    EUserRole.RRHH,
    EUserRole.COORDINADOR_AREA,
    EUserRole.DOCENTE,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('La información de las asignaturas del usuario autenticado')
  @ApiCommonResponses({
    summary: 'Obtener asignaturas del usuario atenticado',
    okDescription:
      'Asignaturas del usuario autenticado obtenidas correctamente.',
    notFoundDescription:
      'El usuario autenticado no cuenta con asignaturas asignadas.',
  })
  findCurrentPeriod(@GetCurrentUserId() userId: string) {
    return this.courseClassroomsService.findCurrentPeriodAndUserId(userId);
  }

  @Get('coordinator/center-department/:centerDepartmentId/periods/:periodId')
  @Roles(EUserRole.COORDINADOR_AREA)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(
    'Detalle de asignaturas para el periodo especificado en un center-department.',
  )
  @ApiCommonResponses({
    summary: 'Consulta de asignaturas por periodo y center-department',
    okDescription: 'Detalle de asignaturas obtenido correctamente.',
    badRequestDescription: 'La solicitud contiene parámetros inválidos.',
    internalErrorDescription: 'Error interno al procesar la solicitud.',
    notFoundDescription:
      'No se encontraron asignaturas para el periodo y center-department especificados.',
  })
  @ApiParam({
    name: 'centerDepartmentId',
    description: 'ID de la relación centro-departamento.',
    type: String,
    format: 'uuid',
  })
  @ApiParam({
    name: 'periodId',
    description: 'ID del periodo académico.',
    type: String,
    format: 'uuid',
  })
  findOneByCoordinatorAndPeriodId(
    @Param('centerDepartmentId', ValidateIdPipe) centerDepartmentId: string,
    @Param('periodId', ValidateIdPipe) periodId: string,
    @GetCurrentUserId() userId: string,
  ) {
    return this.courseClassroomsService.findAllByCoordinatorAndPeriodId(
      userId,
      centerDepartmentId,
      periodId,
    );
  }

  @Patch(':id')
  @Roles(
    EUserRole.ADMIN,
    EUserRole.DIRECCION,
    EUserRole.RRHH,
    EUserRole.COORDINADOR_AREA,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha actualizado la sección de asignatura.')
  @ApiParam({
    name: 'id',
    description: 'ID de la sección de asignatura a actualizar',
    type: String,
    format: 'uuid',
  })
  @ApiBody({ type: UpdateCourseClassroomDto })
  @ApiCommonResponses({
    summary: 'Actualizar una sección de asignatura por ID',
    okDescription: 'Sección de asignatura actualizada correctamente.',
    badRequestDescription: 'Datos inválidos para la actualización.',
    notFoundDescription: 'La sección de asignatura no existe.',
  })
  update(
    @Param('id', ValidateIdPipe) id: string,
    @Body() updateCourseClassroomDto: UpdateCourseClassroomDto,
  ) {
    return this.courseClassroomsService.update(id, updateCourseClassroomDto);
  }

  @Patch(':id/:teacherId')
  @Roles(
    EUserRole.ADMIN,
    EUserRole.DIRECCION,
    EUserRole.RRHH,
    EUserRole.COORDINADOR_AREA,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('La clase ha sido reasignada a otro docente.')
  @ApiParam({
    name: 'id',
    description: 'ID de la clase (CourseClassroom) a reasignar',
    type: String,
    format: 'uuid',
  })
  @ApiParam({
    name: 'teacherId',
    description: 'ID del docente al que se asignará la clase',
    type: String,
    format: 'uuid',
  })
  @ApiCommonResponses({
    summary: 'Reasignar una clase a otro docente',
    okDescription: 'La clase fue reasignada correctamente al nuevo docente.',
    badRequestDescription: 'Datos inválidos para la reasignación.',
    notFoundDescription: 'La clase o el docente no existen.',
  })
  updateCourseClassroom(
    @Param('id', ValidateIdPipe) id: string,
    @Param('teacherId', ValidateIdPipe) teacherId: string,
  ) {
    return this.courseClassroomsService.changeCourseClassroom(teacherId, id);
  }

  @Delete(':id')
  @Roles(
    EUserRole.ADMIN,
    EUserRole.DIRECCION,
    EUserRole.RRHH,
    EUserRole.COORDINADOR_AREA,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha eliminado una sección de asignatura.')
  @ApiParam({
    name: 'id',
    description: 'ID de la sección de asignatura a eliminar',
    type: String,
    format: 'uuid',
  })
  @ApiCommonResponses({
    summary: 'Eliminar una sección de asignatura por ID',
    okDescription: 'Sección de asignatura eliminada correctamente.',
    notFoundDescription: 'La sección de asignatura no existe.',
  })
  remove(@Param('id', ValidateIdPipe) id: string) {
    return this.courseClassroomsService.remove(id);
  }
}
