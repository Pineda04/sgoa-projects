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
import { Roles, ResponseMessage, ApiPagination } from 'src/common/decorators';
import { EUserRole } from 'src/common/enums';
import { ValidateIdPipe } from 'src/common/pipes';
import {
  CreateCourseStadisticDto,
  QueryConsolidatedDto,
  UpdateCourseStadisticDto,
} from '../dto';
import { CourseStadisticsService } from '../services/course-stadistics.service';
import { QueryPaginationDto } from 'src/common/dto';

@Controller('course-stadistics')
@Roles(
  EUserRole.ADMIN,
  EUserRole.DIRECCION,
  EUserRole.RRHH,
  EUserRole.COORDINADOR_AREA,
  EUserRole.DOCENTE,
)
export class CourseStadisticsController {
  constructor(
    private readonly courseStadisticsService: CourseStadisticsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Se ha creado una nueva estadística de asignatura.')
  @ApiBody({
    type: CreateCourseStadisticDto,
    description: 'Datos necesarios para crear una estadística de asignatura.',
  })
  @ApiCommonResponses({
    summary: 'Crear una estadística de asignatura',
    createdDescription: 'Se ha creado una nueva estadística de asignatura.',
    badRequestDescription: 'Datos inválidos para la creación.',
  })
  create(@Body() createCourseStadisticDto: CreateCourseStadisticDto) {
    return this.courseStadisticsService.create(createCourseStadisticDto);
  }

  @Get()
  @Roles(EUserRole.COORDINADOR_AREA, EUserRole.DOCENTE, EUserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de estadísticas de asignatura.')
  @ApiPagination({
    summary: 'Obtener todas las estadísticas de asignatura',
  })
  @ApiCommonResponses({
    summary: 'Obtener todas las estadísticas de asignatura',
    okDescription:
      'Listado de estadísticas de asignatura obtenido correctamente.',
  })
  findAll(@Query() query: QueryPaginationDto) {
    return this.courseStadisticsService.findAllWithPagination(query);
  }

  @Get('consolidated')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(
    'Consolidado de estadísticas según los filtros proporcionados.',
  )
  @ApiCommonResponses({
    summary:
      'Generar un consolidado de estadísticas filtrado por diversos criterios.',
    okDescription: 'El consolidado ha sido generado exitosamente.',
    badRequestDescription: 'Los parámetros proporcionados son inválidos.',
    notFoundDescription:
      'No se encontraron estadísticas que coincidan con los criterios solicitados.',
  })
  @ApiPagination({
    summary:
      'Obtener estadísticas consolidadas de asignaturas filtradas por los parámetros proporcionados.',
  })
  generateConsolidated(
    @Query() query: QueryPaginationDto,
    @Query() searchQuery: QueryConsolidatedDto,
  ) {
    return this.courseStadisticsService.generateConsolidated(
      query,
      searchQuery,
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('La información de la estadística de asignatura.')
  @ApiParam({
    name: 'id',
    description: 'ID de la estadística de asignatura a obtener',
    type: String,
    format: 'uuid',
  })
  @ApiCommonResponses({
    summary: 'Obtener una estadística de asignatura por ID',
    okDescription: 'Estadística de asignatura obtenida correctamente.',
    notFoundDescription: 'La estadística de asignatura no existe.',
  })
  findOne(@Param('id', ValidateIdPipe) id: string) {
    return this.courseStadisticsService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha actualizado la estadística de asignatura.')
  @ApiParam({
    name: 'id',
    description:
      'ID de clase-salón <courseClassroomId> de la estadística a actualizar',
    type: String,
    format: 'uuid',
  })
  @ApiBody({ type: UpdateCourseStadisticDto })
  @ApiCommonResponses({
    summary: 'Actualizar una estadística de asignatura por ID de clase-salón.',
    okDescription: 'Estadística de asignatura actualizada correctamente.',
    badRequestDescription: 'Datos inválidos para la actualización.',
    notFoundDescription: 'La estadística de asignatura no existe.',
  })
  update(
    @Param('id', ValidateIdPipe) id: string,
    @Body() updateCourseStadisticDto: UpdateCourseStadisticDto,
  ) {
    return this.courseStadisticsService.update(id, updateCourseStadisticDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha eliminado una estadística de asignatura.')
  @ApiParam({
    name: 'id',
    description: 'ID de la sección de la estadística de asignatura a eliminar',
    type: String,
    format: 'uuid',
  })
  @ApiCommonResponses({
    summary: 'Eliminar una estadística de asignatura por ID',
    okDescription: 'Estadística de asignatura eliminada correctamente.',
    notFoundDescription: 'La estadística de asignatura no existe.',
  })
  remove(@Param('id', ValidateIdPipe) id: string) {
    return this.courseStadisticsService.remove(id);
  }
}
