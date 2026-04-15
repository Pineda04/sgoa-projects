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
import { UpdateClassroomDto } from '../dto/update-classroom.dto';
import {
  ApiCommonResponses,
  ApiPagination,
  ResponseMessage,
  Roles,
} from 'src/common/decorators';
import { EUserRole } from 'src/common/enums';
import { ValidateIdPipe } from 'src/common/pipes';
import { ClassroomService } from '../services/classroom.service';
import { CreateClassroomDto } from '../dto/create-classroom.dto';
import { QueryPaginationDto } from 'src/common/dto';
import { ApiBody } from '@nestjs/swagger';

@Controller('classrooms')
@Roles(
  EUserRole.ADMIN,
  EUserRole.DIRECCION,
  EUserRole.RRHH,
  EUserRole.COORDINADOR_AREA,
)
export class ClassroomController {
  constructor(private readonly classroomService: ClassroomService) {}

  @Post()
  @Roles(EUserRole.ADMIN, EUserRole.DIRECCION, EUserRole.RRHH)
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Se ha creado un aula.')
  @ApiBody({ type: CreateClassroomDto })
  @ApiCommonResponses({
    summary: 'Crear un aula',
    createdDescription: 'Aula creada exitosamente.',
    badRequestDescription: 'Datos inválidos para crear el aula.',
    internalErrorDescription: 'Error interno al crear el aula.',
  })
  create(@Body() createClassroomDto: CreateClassroomDto) {
    return this.classroomService.create(createClassroomDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de aulas.')
  @ApiPagination({
    summary: 'Obtener todas las aulas',
    description: 'Devuelve una lista de todas las aulas.',
  })
  @ApiCommonResponses({
    summary: 'Obtener todas las aulas',
    okDescription: 'Listado de aulas obtenido correctamente.',
  })
  findAll(@Query() query: QueryPaginationDto) {
    return this.classroomService.findAllWithPagination(query);
  }

  @Get('search')
  @Roles(
    EUserRole.ADMIN,
    EUserRole.RRHH,
    EUserRole.DIRECCION,
    EUserRole.COORDINADOR_AREA,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de aulas encontrado correctamente.')
  @ApiCommonResponses({
    summary: 'Buscar aulas por término',
    okDescription:
      'Retorna un listado paginado de aulas que coinciden con el término de búsqueda.',
  })
  @ApiPagination({
    summary: 'Búsqueda de usuario',
    description:
      'Permite buscar aulas utilizando un término (nombre, edificio...) y obtener los resultados de forma paginada.',
  })
  findBySearchTerm(
    @Query('searchTerm') searchTerm: string,
    @Query() query: QueryPaginationDto,
  ) {
    return this.classroomService.findBySearchTerm(searchTerm, query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha encontrado el aula.')
  @ApiCommonResponses({
    summary: 'Obtener un aula por ID',
    okDescription: 'Aula obtenida correctamente.',
    notFoundDescription: 'El aula no existe.',
  })
  findOne(@Param('id', ValidateIdPipe) id: string) {
    return this.classroomService.findOne(id);
  }

  @Patch(':id')
  @Roles(EUserRole.ADMIN, EUserRole.DIRECCION, EUserRole.RRHH)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha actualizado el aula.')
  @ApiBody({ type: UpdateClassroomDto })
  @ApiCommonResponses({
    summary: 'Actualizar un aula por ID',
    okDescription: 'Aula actualizada correctamente.',
    badRequestDescription: 'Datos inválidos para la actualización.',
    notFoundDescription: 'El aula no existe.',
  })
  update(
    @Param('id', ValidateIdPipe) id: string,
    @Body() updateClassroomDto: UpdateClassroomDto,
  ) {
    return this.classroomService.update(id, updateClassroomDto);
  }

  @Delete(':id')
  @Roles(EUserRole.ADMIN, EUserRole.DIRECCION, EUserRole.RRHH)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha eliminado el aula.')
  @ApiCommonResponses({
    summary: 'Eliminar un aula por ID',
    okDescription: 'Aula eliminada correctamente.',
    notFoundDescription: 'El aula no existe.',
  })
  remove(@Param('id', ValidateIdPipe) id: string) {
    return this.classroomService.remove(id);
  }
}
