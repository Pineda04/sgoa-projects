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
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { TeachersService } from '../services/teachers.service';
import { CreateTeacherDto } from '../dto/create-teacher.dto';
import { UpdateTeacherDto } from '../dto/update-teacher.dto';
import {
  ApiPagination,
  GetCurrentUserId,
  ResponseMessage,
  Roles,
} from 'src/common/decorators';
import { ApiCommonResponses } from 'src/common/decorators/api-response.decorator';
import { EUserRole } from 'src/common/enums';
import { ExtractIdInterceptor } from 'src/common/interceptors';
import { ValidateIdPipe } from 'src/common/pipes';
import { QueryPaginationDto } from 'src/common/dto';
import { ApiBody } from '@nestjs/swagger';
import { TeacherDepartmentPositionService } from '../services/teacher-department-position.service';

@Controller('teachers')
export class TeachersController {
  constructor(
    private readonly teachersService: TeachersService,
    private readonly teacherDepartmentPositionService: TeacherDepartmentPositionService,
  ) {}

  @Post()
  @Roles(EUserRole.ADMIN, EUserRole.COORDINADOR_AREA, EUserRole.RRHH)
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Se ha creado un perfil de docente.')
  @ApiBody({
    type: CreateTeacherDto,
    description: 'Datos para crear un perfil de docente',
  })
  @ApiCommonResponses({
    summary: 'Crear un perfil de docente',
    createdDescription: 'Se ha creado un perfil de docente.',
  })
  create(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teachersService.create(createTeacherDto);
  }

  // FIX: eliminar esto, ya que cuando se crea un usuario, si es DOCENTE o COORDINADOR_AREA,...
  // ...se debe elegir el departamento al que pertenece
  @Post('my')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Se ha creado un perfil de docente.')
  @UseInterceptors(ExtractIdInterceptor)
  @ApiBody({
    type: CreateTeacherDto,
    description: 'Datos para crear mi perfil de docente',
  })
  @ApiCommonResponses({
    summary: 'Crear mi perfil de docente',
    createdDescription: 'Se ha creado un perfil de docente.',
  })
  createMyTeacherProfile(@Body() createTeacherDto: CreateTeacherDto) {
    createTeacherDto.userId = createTeacherDto.currentUserId!; // no es una ruta pública, currentUserId siempre existe
    return this.teachersService.create(createTeacherDto);
  }

  @Get()
  @Roles(
    EUserRole.ADMIN,
    EUserRole.COORDINADOR_AREA,
    EUserRole.RRHH,
    EUserRole.DIRECCION,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de docentes.')
  @ApiPagination({
    summary: 'Obtener todos los docentes',
    description: 'Devuelve una lista de todos los docentes.',
  })
  @ApiCommonResponses({
    summary: 'Obtener todos los docentes',
    okDescription: 'Listado de docentes.',
  })
  findAll(@Query() query: QueryPaginationDto) {
    return this.teachersService.findAllWithPagination(query);
  }

  // para que un coordinador de area pueda ver los docentes de su area o departamento
  // en este caso solo es para el rol COORDINADOR_AREA, y siempre y cuando este autenticado
  // no necesita el departmentId en la url, ya que el coordinador de área solo puede ver los docentes de su departamento
  // solo funcionara si el coordinador inicia sesión y tiene un departamento asignado
  @Get('coordinator/center-department/:centerDepartmentId')
  @Roles(EUserRole.COORDINADOR_AREA)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(
    'Listado de docentes con su centro-departamento y cargo en el center-department especificado para coordinadores de área.',
  )
  @ApiCommonResponses({
    summary:
      'Listar docentes con su centro-departamento y cargo por center-department en específico para coordinadores de área',
    okDescription: 'Listado obtenido correctamente para el coordinador.',
    badRequestDescription:
      'Solicitud inválida al obtener los docentes para coordinador.',
    internalErrorDescription:
      'Error interno al obtener los docentes para coordinador.',
    notFoundDescription:
      'No se encontraron docentes para el coordinador en el center-department indicado.',
  })
  @ApiPagination({
    summary:
      'Listar docentes con su centro-departamento y cargo por center-departamento en específico (rol COORDINADOR_AREA)',
    description:
      'Obtiene un listado paginado de docentes con su centro-departamento y cargo asociados al center-department especificado para coordinadores de área.',
  })
  async findAllByCoordinator(
    @Query() query: QueryPaginationDto,
    @Param('centerDepartmentId', ValidateIdPipe) centerDepartmentId: string,
    @GetCurrentUserId() userId: string,
  ) {
    // validar que realmente sea coordinador de ese centerDepartment
    const userPosition =
      await this.teacherDepartmentPositionService.findOneDepartmentHeadByUserIdAndCenterDepartment(
        userId,
        centerDepartmentId,
      );

    return await this.teachersService.findAllByDepartmentIdWithPagination(
      query,
      userPosition.centerDepartment.departmentId,
      userPosition.teacher.id,
    );
  }

  @Get('teacher/:id')
  @Roles(
    EUserRole.ADMIN,
    EUserRole.COORDINADOR_AREA,
    EUserRole.RRHH,
    EUserRole.DIRECCION,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha encontrado el docente por ID de usuario.')
  @ApiCommonResponses({
    summary: 'Obtener docente por ID de usuario',
    okDescription: 'Se ha encontrado el docente por ID de usuario.',
  })
  findTeacherByUserId(@Param('id', ValidateIdPipe) id: string) {
    return this.teachersService.findOneByUserId(id);
  }

  @Get('search')
  @Roles(
    EUserRole.ADMIN,
    EUserRole.COORDINADOR_AREA,
    EUserRole.RRHH,
    EUserRole.DIRECCION,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de docentes encontrado correctamente.')
  @ApiCommonResponses({
    summary: 'Buscar docentes por término',
    okDescription:
      'Retorna un listado paginado de docentes que coinciden con el término de búsqueda.',
  })
  @ApiPagination({
    summary: 'Búsqueda de docentes',
    description:
      'Permite buscar docentes utilizando un término (nombre, código y correo) y obtener los resultados de forma paginada.',
  })
  findBySearchTerm(
    @Query('searchTerm') searchTerm: string,
    @Query() query: QueryPaginationDto,
  ) {
    return this.teachersService.findBySearchTerm(searchTerm, query);
  }

  @Get('my')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Perfil de docente autenticado.')
  @ApiCommonResponses({
    summary: 'Perfil de docente autenticado',
    createdDescription: 'Perfil de docente autenticado.',
  })
  getCurrentProfile(@GetCurrentUserId() userId: string) {
    return this.teachersService.findOneByUserId(userId);
  }

  @Get(':id')
  @Roles(
    EUserRole.ADMIN,
    EUserRole.COORDINADOR_AREA,
    EUserRole.RRHH,
    EUserRole.DIRECCION,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha encontrado el docente.')
  @ApiCommonResponses({
    summary: 'Obtener un docente por ID',
    okDescription: 'Se ha encontrado el docente.',
  })
  findOne(@Param('id', ValidateIdPipe) id: string) {
    return this.teachersService.findOne(id);
  }

  @Patch('my')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Docente actualizado exitosamente.')
  @ApiBody({
    type: UpdateTeacherDto,
    description:
      'Datos para actualizar un perfil de docente (usuario autenticado)',
  })
  async updateMy(
    @GetCurrentUserId() userId: string,
    @Body() updateTeacherDto: UpdateTeacherDto,
  ) {
    const teacher = await this.teachersService.findOneByUserId(userId);

    return await this.teachersService.update(teacher.id, updateTeacherDto);
  }

  @Patch(':id')
  @Roles(EUserRole.ADMIN, EUserRole.COORDINADOR_AREA, EUserRole.RRHH)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Docente actualizado exitosamente.')
  @ApiBody({
    type: UpdateTeacherDto,
    description: 'Datos para actualizar un perfil de docente',
  })
  @ApiCommonResponses({
    summary: 'Actualizar un docente por ID',
    okDescription: 'Se ha actualizado el docente.',
  })
  update(
    @Param('id', ValidateIdPipe) id: string,
    @Body() updateTeacherDto: UpdateTeacherDto,
  ) {
    return this.teachersService.update(id, updateTeacherDto);
  }

  // Cambiar el active status del usuario a false, para no eliminar el registro físicamente
  @Delete(':id')
  @Roles(EUserRole.ADMIN, EUserRole.COORDINADOR_AREA, EUserRole.RRHH)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Cambio de active status cambiado exitosamente.')
  @ApiCommonResponses({
    summary: 'Cambiar el active status del docente por ID',
    okDescription: 'Se ha cambiado el active status del docente.',
  })
  remove(@Param('id', ValidateIdPipe) id: string) {
    return this.teachersService.remove(id);
  }
}
