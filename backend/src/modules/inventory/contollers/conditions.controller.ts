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
import { ApiBody } from '@nestjs/swagger';
import { ApiCommonResponses, ResponseMessage } from 'src/common/decorators';
import { Roles } from 'src/common/decorators';
import { EUserRole } from 'src/common/enums';
import { ValidateIdPipe } from 'src/common/pipes';
import { CreateConditionDto, UpdateConditionDto } from '../dto';
import { ConditionsService } from '../services/conditions.service';

@Controller('conditions')
@Roles(
  EUserRole.ADMIN,
  EUserRole.DIRECCION,
  EUserRole.RRHH,
  EUserRole.COORDINADOR_AREA,
)
export class ConditionsController {
  constructor(private readonly conditionService: ConditionsService) {}

  @Post()
  @Roles(EUserRole.ADMIN, EUserRole.DIRECCION, EUserRole.RRHH)
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Condición creada exitosamente.')
  @ApiBody({
    type: CreateConditionDto,
    description: 'Datos para crear una condición',
    required: true,
  })
  @ApiCommonResponses({
    summary: 'Crear condición',
    createdDescription: 'Condición creada correctamente.',
  })
  create(@Body() createConditionDto: CreateConditionDto) {
    return this.conditionService.create(createConditionDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de condiciones.')
  @ApiCommonResponses({
    summary: 'Listar condiciones',
    okDescription: 'Listado de condiciones.',
  })
  findAll() {
    return this.conditionService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Condición obtenida.')
  @ApiCommonResponses({
    summary: 'Obtener condición',
    okDescription: 'Condición obtenida.',
    notFoundDescription: 'No se encontró la condición solicitada.',
  })
  findOne(@Param('id', ValidateIdPipe) id: string) {
    return this.conditionService.findOne(id);
  }

  @Patch(':id')
  @Roles(EUserRole.ADMIN, EUserRole.DIRECCION, EUserRole.RRHH)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Condición actualizada.')
  @ApiBody({
    type: UpdateConditionDto,
    description: 'Datos para actualizar una condición',
    required: true,
  })
  @ApiCommonResponses({
    summary: 'Actualizar condición',
    okDescription: 'Condición actualizada.',
    notFoundDescription: 'No se encontró la condición solicitada.',
  })
  update(
    @Param('id', ValidateIdPipe) id: string,
    @Body() updateConditionDto: UpdateConditionDto,
  ) {
    return this.conditionService.update(id, updateConditionDto);
  }

  @Delete(':id')
  @Roles(EUserRole.ADMIN, EUserRole.DIRECCION, EUserRole.RRHH)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Condición eliminada.')
  @ApiCommonResponses({
    summary: 'Eliminar condición',
    okDescription: 'Condición eliminada.',
    notFoundDescription: 'No se encontró la condición solicitada.',
  })
  remove(@Param('id', ValidateIdPipe) id: string) {
    return this.conditionService.remove(id);
  }
}
