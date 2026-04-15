import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { UpdateDepartmentDto } from '../dto/update-department.dto';
import { DepartmentsService } from '../services/departments.service';
import { Roles } from 'src/common/decorators';
import { EUserRole } from 'src/common/enums';
import { ValidateIdPipe } from 'src/common/pipes';
import { ApiParam } from '@nestjs/swagger';
import { ApiBody } from '@nestjs/swagger';
import { ApiCommonResponses, ResponseMessage } from 'src/common/decorators';

@Controller('departments')
@Roles(EUserRole.ADMIN, EUserRole.DIRECCION, EUserRole.RRHH)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Se ha creado un departamento.')
  @ApiBody({
    type: CreateDepartmentDto,
    description: 'Datos necesarios para crear un departamento.',
  })
  @ApiCommonResponses({
    summary: 'Crear un departamento',
    createdDescription: 'Departamento creado exitosamente.',
    badRequestDescription: 'Datos inválidos para crear el departamento.',
    internalErrorDescription: 'Error interno al crear el departamento.',
  })
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  @Roles(
    EUserRole.COORDINADOR_AREA,
    EUserRole.ADMIN,
    EUserRole.DOCENTE,
    EUserRole.DIRECCION,
    EUserRole.RRHH,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de departamentos.')
  @ApiCommonResponses({
    summary: 'Obtener todos los departamentos',
    okDescription: 'Listado de departamentos.',
  })
  findAll() {
    return this.departmentsService.findAllWithCoordinators();
  }

  @Get(':id')
  @Roles(EUserRole.COORDINADOR_AREA, EUserRole.DOCENTE)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Información del departamento.')
  @ApiParam({
    name: 'id',
    description: 'ID del departamento a buscar',
    type: String,
    format: 'uuid',
  })
  @ApiCommonResponses({
    summary: 'Obtener un departamento por ID',
    okDescription: 'Información del departamento.',
    notFoundDescription: 'El departamento no existe.',
  })
  findOne(@Param('id', ValidateIdPipe) id: string) {
    return this.departmentsService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha actualizado el departamento.')
  @ApiParam({
    name: 'id',
    description: 'ID del departamento a actualizar',
    type: String,
    format: 'uuid',
  })
  @ApiBody({ type: UpdateDepartmentDto })
  @ApiCommonResponses({
    summary: 'Actualizar un departamento por ID',
    okDescription: 'Se ha actualizado el departamento.',
    badRequestDescription: 'Datos inválidos para la actualización.',
    notFoundDescription: 'El departamento no existe.',
  })
  update(
    @Param('id', ValidateIdPipe) id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha eliminado el departamento.')
  @ApiParam({
    name: 'id',
    description: 'ID del departamento a eliminar',
    type: String,
    format: 'uuid',
  })
  @ApiCommonResponses({
    summary: 'Eliminar un departamento por ID',
    okDescription: 'Se ha eliminado el departamento.',
    notFoundDescription: 'El departamento no existe.',
  })
  remove(@Param('id', ValidateIdPipe) id: string) {
    return this.departmentsService.remove(id);
  }
}
