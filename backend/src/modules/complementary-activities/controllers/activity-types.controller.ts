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
} from '@nestjs/common';
import { ApiCommonResponses } from 'src/common/decorators/api-response.decorator';
import { ActivityTypesService } from '../services/activity-types.service';
import { ApiBody, ApiParam } from '@nestjs/swagger';
import { Roles, ResponseMessage } from 'src/common/decorators';
import { EUserRole } from 'src/common/enums';
import { ValidateIdPipe } from 'src/common/pipes';
import { CreateActivityTypeDto, UpdateActivityTypeDto } from '../dto';

@Controller('activity-types')
export class ActivityTypesController {
  constructor(private readonly activityTypesService: ActivityTypesService) {}

  @Post()
  @Roles(EUserRole.ADMIN, EUserRole.DIRECCION, EUserRole.RRHH)
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Se ha creado un tipo de actividad.')
  @ApiBody({
    type: CreateActivityTypeDto,
    description: 'Datos necesarios para crear un tipo de actividad.',
  })
  @ApiCommonResponses({
    summary: 'Crear tipo de actividad',
    description: 'Crea un nuevo tipo de actividad en el sistema.',
    createdDescription: 'Tipo de actividad creado exitosamente.',
    badRequestDescription:
      'Datos inválidos para la creación del tipo de actividad.',
    internalErrorDescription: 'Error interno al crear el tipo de actividad.',
  })
  create(
    @Body()
    createActivityTypeDto: CreateActivityTypeDto,
  ) {
    return this.activityTypesService.create(createActivityTypeDto);
  }

  @Get()
  @Roles(EUserRole.ADMIN, EUserRole.DIRECCION, EUserRole.RRHH)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de tipos de actividades.')
  @ApiCommonResponses({
    summary: 'Listar tipos de actividades',
    description:
      'Obtiene la lista de todos los tipos de actividades registradas.',
    okDescription: 'Lista de tipos de actividades obtenida correctamente.',
    internalErrorDescription:
      'Error interno al obtener los tipos de actividades.',
  })
  findAll() {
    return this.activityTypesService.findAll();
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
  @ResponseMessage('La información del tipo de actividad.')
  @ApiParam({
    name: 'id',
    description: 'ID del tipo de actividad a obtener',
    type: String,
    format: 'uuid',
  })
  @ApiCommonResponses({
    summary: 'Obtener tipo de actividad por ID',
    description:
      'Obtiene la información de un tipo de actividad específico por su ID.',
    okDescription: 'Tipo de actividad obtenido correctamente.',
    internalErrorDescription: 'Error interno al obtener el tipo de actividad.',
    notFoundDescription: 'No se encontró el tipo de actividad solicitado.',
  })
  findOne(@Param('id', ValidateIdPipe) id: string) {
    return this.activityTypesService.findOne(id);
  }

  @Patch(':id')
  @Roles(EUserRole.ADMIN, EUserRole.DIRECCION, EUserRole.RRHH)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha actualizado el tipo de actividad.')
  @ApiParam({
    name: 'id',
    description: 'ID del tipo de actividad a actualizar',
    type: String,
    format: 'uuid',
  })
  @ApiBody({
    type: UpdateActivityTypeDto,
    description: 'Datos para actualizar tipo de actividad',
    required: true,
  })
  @ApiCommonResponses({
    summary: 'Actualizar tipo de actividad',
    description: 'Actualiza la información de un tipo de actividad existente.',
    internalErrorDescription:
      'Error interno al actualizar el tipo de actividad.',
    notFoundDescription: 'No se encontró el tipo de actividad solicitado.',
  })
  update(
    @Param('id', ValidateIdPipe) id: string,
    @Body()
    updateActivityTypeDto: UpdateActivityTypeDto,
  ) {
    return this.activityTypesService.update(id, updateActivityTypeDto);
  }

  @Delete(':id')
  @Roles(EUserRole.ADMIN, EUserRole.DIRECCION, EUserRole.RRHH)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha eliminado un tipo de actividad.')
  @ApiParam({
    name: 'id',
    description: 'ID del tipo de actividad a eliminar',
    type: String,
    format: 'uuid',
  })
  @ApiCommonResponses({
    summary: 'Eliminar tipo de actividad',
    description: 'Elimina un tipo de actividad del sistema por su ID.',
    internalErrorDescription: 'Error interno al eliminar el tipo de actividad.',
    notFoundDescription: 'No se encontró el tipo de actividad solicitado.',
  })
  remove(@Param('id', ValidateIdPipe) id: string) {
    return this.activityTypesService.remove(id);
  }
}
