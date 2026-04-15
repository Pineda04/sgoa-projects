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
import { ApiBody } from '@nestjs/swagger';
import { ApiCommonResponses } from 'src/common/decorators';
import { CreateTeacherDepartmentPositionDto } from '../dto/create-teacher-department-position.dto';
import { UpdateTeacherDepartmentPositionDto } from '../dto/update-teacher-department-position.dto';
import { TeacherDepartmentPositionService } from '../services/teacher-department-position.service';
import { ValidateIdPipe } from 'src/common/pipes';
import { EUserRole } from 'src/common/enums';
import {
  ApiPagination,
  GetCurrentUserId,
  ResponseMessage,
  Roles,
} from 'src/common/decorators';
import { QueryPaginationDto } from 'src/common/dto';
import { ApiParam } from '@nestjs/swagger';

@Controller('teacher-department-position')
@Roles(
  EUserRole.ADMIN,
  EUserRole.COORDINADOR_AREA,
  EUserRole.RRHH,
  EUserRole.DIRECCION,
)
export class TeacherDepartmentPositionController {
  constructor(
    private readonly teacherDepartmentPositionService: TeacherDepartmentPositionService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage(
    'Se ha creado la relación docente–centro-departamento–cargo.',
  )
  @ApiBody({
    type: CreateTeacherDepartmentPositionDto,
    description:
      'Datos para crear la relación docente–centro-departamento–cargo.',
  })
  @ApiCommonResponses({
    summary: 'Crear relación docente–centro-departamento–cargo',
    createdDescription:
      'Relación docente–centro-departamento–cargo creada exitosamente.',
    badRequestDescription:
      'Datos inválidos para crear la relación docente–centro-departamento–cargo.',
    internalErrorDescription:
      'Error interno al crear la relación docente–centro-departamento–cargo.',
  })
  create(
    @Body()
    createTeacherDepartmentPositionDto: CreateTeacherDepartmentPositionDto,
  ) {
    return this.teacherDepartmentPositionService.create(
      createTeacherDepartmentPositionDto,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de docentes con su centro-departamento y cargo.')
  @ApiCommonResponses({
    summary: 'Listar docentes con su centro-departamento y cargo',
    okDescription:
      'Listado de docentes con centro-departamento y cargo obtenido correctamente.',
    badRequestDescription:
      'Solicitud inválida al obtener los docentes con centro-departamento y cargo.',
    internalErrorDescription:
      'Error interno al obtener los docentes con centro-departamento y cargo.',
    notFoundDescription:
      'No se encontraron docentes con centro-departamento y cargo.',
  })
  @ApiPagination({
    summary: 'Listar docentes con su centro-departamento y cargo',
    description:
      'Obtiene un listado paginado de docentes con su centro-departamento y cargo',
  })
  findAll(@Query() query: QueryPaginationDto) {
    return this.teacherDepartmentPositionService.findAllWithPagination(query);
  }

  @Get('center-department/:centerDepartmentId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(
    'Listado de docentes con su centro-departamento y cargo en un centro-departamento específico.',
  )
  @ApiCommonResponses({
    summary:
      'Listar docentes con su centro-departamento y cargo por centro-departamento específico',
    okDescription: 'Listado obtenido correctamente.',
    badRequestDescription:
      'Solicitud inválida al obtener los docentes por centro-departamento.',
    internalErrorDescription:
      'Error interno al obtener los docentes por centro-departamento.',
    notFoundDescription:
      'No se encontraron docentes para el centro-departamento.',
  })
  @ApiParam({
    name: 'centerDepartmentId',
    description:
      'ID de la relación centro-departamento para filtrar los docentes',
    type: String,
    format: 'uuid',
  })
  @ApiPagination({
    summary:
      'Listar docentes con su centro-departamento y cargo por centro-departamento en específico',
    description:
      'Obtiene un listado paginado de docentes con su centro-departamento y cargo asociados a un centro-departamento específico',
  })
  findAllByCenterDepartmentId(
    @Query() query: QueryPaginationDto,
    @Param('centerDepartmentId', ValidateIdPipe) centerDepartmentId: string,
  ) {
    return this.teacherDepartmentPositionService.findAllByCenterDepartmentId(
      query,
      centerDepartmentId,
    );
  }

  // para que un coordinador de area pueda ver los docentes de su area o centro-departamento
  // en este caso solo es para el rol COORDINADOR_AREA, y siempre y cuando este autenticado
  // no necesita el centerDepartmentId en la url si frontend lo provee de otra forma,
  // pero esta ruta exige centerDepartmentId para evitar ambigüedad si el usuario tiene múltiples coordinaciones
  @Get('coordinator/:centerDepartmentId')
  @Roles(EUserRole.COORDINADOR_AREA)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(
    'Listado de docentes con su centro-departamento y cargo en el center-departamento especificado para coordinadores de área.',
  )
  @ApiParam({
    name: 'centerDepartmentId',
    description: 'ID de la relación centro-departamento.',
    type: String,
    format: 'uuid',
  })
  @ApiPagination({
    summary: 'Listar docentes por center-department para coordinadores de área',
    description:
      'Obtiene un listado paginado de docentes asociados al center-department específico (se requiere que el usuario sea coordinador de ese center-department).',
  })
  async findAllByCoordinator(
    @Query() query: QueryPaginationDto,
    @Param('centerDepartmentId', ValidateIdPipe) centerDepartmentId: string,
    @GetCurrentUserId() userId: string,
  ) {
    // valida que el usuario sea jefe/coordinador en ese centerDepartment
    const userPosition =
      await this.teacherDepartmentPositionService.findOneDepartmentHeadByUserIdAndCenterDepartment(
        userId,
        centerDepartmentId,
      );

    // userPosition.teacher.id es el id del teacher (puede usarse como omitId o para permisos)
    return await this.teacherDepartmentPositionService.findAllByCenterDepartmentId(
      query,
      centerDepartmentId,
      userPosition.teacher.id, // opcional: omitTeacherId para excluir al propio coordinador si así lo deseas
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(
    'Información de la relación docente–centro-departamento–cargo.',
  )
  @ApiCommonResponses({
    summary: 'Obtener una relación docente–centro-departamento–cargo por ID',
    okDescription: 'Relación obtenida correctamente.',
    badRequestDescription: 'ID inválido para obtener la relación.',
    internalErrorDescription: 'Error interno al obtener la relación.',
    notFoundDescription: 'No se encontró la relación solicitada.',
  })
  findOne(@Param('id', ValidateIdPipe) id: string) {
    return this.teacherDepartmentPositionService.findOne(id);
  }

  @Get('my/coordinations')
  @Roles(EUserRole.DOCENTE, EUserRole.COORDINADOR_AREA)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de coordinaciones activas del usuario autenticado.')
  @ApiCommonResponses({
    summary: 'Obtener coordinaciones activas del usuario',
    okDescription: 'Coordinaciones obtenidas correctamente.',
    badRequestDescription: 'Solicitud inválida al obtener las coordinaciones.',
    internalErrorDescription: 'Error interno al obtener las coordinaciones.',
    notFoundDescription: 'No se encontraron coordinaciones para el usuario.',
  })
  findMyCoordinations(@GetCurrentUserId() userId: string) {
    return this.teacherDepartmentPositionService.findDepartmentHeadPositionsByUserId(
      userId,
    );
  }

  @Get('my/center-department/:centerDepartmentId')
  @Roles(EUserRole.DOCENTE, EUserRole.COORDINADOR_AREA)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(
    'Información de las relaciones docente–centro-departamento para el usuario autenticado en el center-departamento especificado.',
  )
  @ApiCommonResponses({
    summary:
      'Obtener las relaciones docente–centro-departamento para el usuario autenticado y un center-departamento específico.',
    okDescription: 'Relaciones obtenidas correctamente.',
    badRequestDescription:
      'Parámetros inválidos para obtener las relaciones docente–centro-departamento.',
    internalErrorDescription:
      'Error interno al obtener las relaciones docente–centro-departamento.',
    notFoundDescription:
      'No se encontraron relaciones docente–centro-departamento para el usuario en el center-departamento indicado.',
  })
  findRelationsByUserAndCenterDepartment(
    @GetCurrentUserId() userId: string,
    @Param('centerDepartmentId', ValidateIdPipe) centerDepartmentId: string,
  ) {
    return this.teacherDepartmentPositionService.findPositionsByUserAndCenterDepartment(
      userId,
      centerDepartmentId,
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(
    'Relación docente–centro-departamento–cargo actualizada correctamente.',
  )
  @ApiCommonResponses({
    summary: 'Actualizar una relación docente–centro-departamento–cargo por ID',
    okDescription: 'Relación actualizada correctamente.',
    badRequestDescription: 'Datos inválidos para actualizar la relación.',
    internalErrorDescription: 'Error interno al actualizar la relación.',
    notFoundDescription: 'No se encontró la relación a actualizar.',
  })
  update(
    @Param('id', ValidateIdPipe) id: string,
    @Body()
    updateTeacherDepartmentPositionDto: UpdateTeacherDepartmentPositionDto,
  ) {
    return this.teacherDepartmentPositionService.update(
      id,
      updateTeacherDepartmentPositionDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(
    'Relación docente–centro-departamento–cargo eliminada correctamente.',
  )
  @ApiCommonResponses({
    summary: 'Eliminar una relación docente–centro-departamento–cargo por ID',
    okDescription: 'Relación eliminada correctamente.',
    badRequestDescription: 'ID inválido para eliminar la relación.',
    internalErrorDescription: 'Error interno al eliminar la relación.',
    notFoundDescription: 'No se encontró la relación a eliminar.',
  })
  remove(@Param('id', ValidateIdPipe) id: string) {
    return this.teacherDepartmentPositionService.remove(id);
  }
}
