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
  Query,
} from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import { ApiBody } from '@nestjs/swagger';
import { ApiCommonResponses } from 'src/common/decorators/api-response.decorator';
import { ApiPagination, ResponseMessage, Roles } from 'src/common/decorators';
import { EUserRole } from 'src/common/enums';
import { ValidateIdPipe } from 'src/common/pipes';
import { CreateCourseDto, UpdateCourseDto } from '../dto';
import { CoursesService } from '../services/courses.service';
import { QueryPaginationDto } from 'src/common/dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles(
    EUserRole.ADMIN,
    EUserRole.DIRECCION,
    EUserRole.RRHH,
    EUserRole.COORDINADOR_AREA,
  )
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Se ha creado una asignatura.')
  @ApiBody({
    type: CreateCourseDto,
    description: 'Datos necesarios para crear una asignatura.',
  })
  @ApiCommonResponses({
    summary: 'Crear una asignatura',
    createdDescription: 'Se ha creado una asignatura.',
    badRequestDescription: 'Datos inválidos para la creación.',
  })
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  @Roles(
    EUserRole.ADMIN,
    EUserRole.DIRECCION,
    EUserRole.RRHH,
    EUserRole.COORDINADOR_AREA,
    EUserRole.DOCENTE,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de asignaturas.')
  @ApiPagination({
    summary: 'Obtener todas las asignaturas',
  })
  @ApiCommonResponses({
    summary: 'Obtener todas las asignaturas',
    description: 'Devuelve una lista de todas las asignaturas.',
    okDescription: 'Listado de asignaturas obtenido correctamente.',
  })
  findAll(@Query() query: QueryPaginationDto) {
    return this.coursesService.findAllWithPagination(query);
  }

  @Get('search')
  @Roles(
    EUserRole.ADMIN,
    EUserRole.COORDINADOR_AREA,
    EUserRole.RRHH,
    EUserRole.DIRECCION,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de clases encontrado correctamente')
  @ApiCommonResponses({
    summary: 'Buscar clases por término',
    okDescription:
      'Retorna un listado paginado de clases que coinciden con el término de búsqueda.',
  })
  @ApiPagination({
    summary: 'Búsqueda de clases',
    description:
      'Permite buscar clases utilizando un término (nombre y código) y obtener los resultados de forma paginada.',
  })
  findBySearchTerm(
    @Query('searchTerm') searchTerm: string,
    @Query() query: QueryPaginationDto,
  ) {
    return this.coursesService.findBySearchTerm(searchTerm, query);
  }

  @Get('search/:centerDepartmentId')
  @Roles(
    EUserRole.ADMIN,
    EUserRole.COORDINADOR_AREA,
    EUserRole.RRHH,
    EUserRole.DIRECCION,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(
    'Listado de clases del centro-departmento encontradas correctamente',
  )
  @ApiCommonResponses({
    summary: 'Buscar clases por término e ID de centro-departmento',
    okDescription:
      'Retorna un listado paginado de clases que coinciden con el término de búsqueda y el centro-departmento especificado.',
  })
  @ApiPagination({
    summary: 'Búsqueda de clases',
    description:
      'Permite buscar clases utilizando un término (nombre y código) y obtener los resultados de forma paginada. Si se coloca el ID del centro-departmento retornara solo clases asociadas a ese centro-departmento',
  })
  findBySearchTermAndCenterDepartment(
    @Query('searchTerm') searchTerm: string,
    @Query() query: QueryPaginationDto,
    @Param('centerDepartmentId', ValidateIdPipe) centerDepartmentId: string,
  ) {
    return this.coursesService.findBySearchTerm(
      searchTerm,
      query,
      centerDepartmentId,
    );
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
  @ResponseMessage('La información de la asignatura.')
  @ApiParam({
    name: 'id',
    description: 'ID de la asignatura a obtener',
    type: String,
    format: 'uuid',
  })
  @ApiCommonResponses({
    summary: 'Obtener una asignatura por ID',
    okDescription: 'Asignatura obtenida correctamente.',
    notFoundDescription: 'La asignatura no existe.',
  })
  findOne(@Param('id', ValidateIdPipe) id: string) {
    return this.coursesService.findOne(id);
  }

  @Get('code/:code')
  @Roles(
    EUserRole.ADMIN,
    EUserRole.DIRECCION,
    EUserRole.RRHH,
    EUserRole.COORDINADOR_AREA,
    EUserRole.DOCENTE,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('La información de la asignatura.')
  @ApiCommonResponses({
    summary: 'Obtener una asignatura por código',
    okDescription: 'Asignatura obtenida correctamente por código.',
    notFoundDescription: 'La asignatura no existe.',
  })
  findOneByCode(@Param('code') code: string) {
    return this.coursesService.findOneByCode(code);
  }

  @Patch(':id')
  @Roles(
    EUserRole.ADMIN,
    EUserRole.DIRECCION,
    EUserRole.RRHH,
    EUserRole.COORDINADOR_AREA,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha actualizado la asignatura.')
  @ApiParam({
    name: 'id',
    description: 'ID de la asignatura a actualizar',
    type: String,
    format: 'uuid',
  })
  @ApiBody({ type: UpdateCourseDto })
  @ApiCommonResponses({
    summary: 'Actualizar una asignatura por ID',
    okDescription: 'Asignatura actualizada correctamente.',
    badRequestDescription: 'Datos inválidos para la actualización.',
    notFoundDescription: 'La asignatura no existe.',
  })
  update(
    @Param('id', ValidateIdPipe) id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @Roles(
    EUserRole.ADMIN,
    EUserRole.DIRECCION,
    EUserRole.RRHH,
    EUserRole.COORDINADOR_AREA,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha eliminado una asignatura.')
  @ApiParam({
    name: 'id',
    description: 'ID de la asignatura a eliminar',
    type: String,
    format: 'uuid',
  })
  @ApiCommonResponses({
    summary: 'Eliminar una asignatura por ID',
    okDescription: 'Asignatura eliminada correctamente.',
    notFoundDescription: 'La asignatura no existe.',
  })
  remove(@Param('id', ValidateIdPipe) id: string) {
    return this.coursesService.remove(id);
  }
}
