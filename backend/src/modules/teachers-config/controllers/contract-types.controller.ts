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
import { ResponseMessage, ApiCommonResponses } from 'src/common/decorators';
import { CreateContractTypeDto } from '../dto/create-contract-type.dto';
import { UpdateContractTypeDto } from '../dto/update-contract-type.dto';
import { ContractTypesService } from '../services/contract-types.service';
import { Roles } from 'src/common/decorators';
import { EUserRole } from 'src/common/enums';
import { ValidateIdPipe } from 'src/common/pipes';

@Controller('contract-types')
@Roles(EUserRole.ADMIN, EUserRole.RRHH, EUserRole.DIRECCION)
export class ContractTypesController {
  constructor(private readonly contractTypesService: ContractTypesService) {}

  @Post()
  @Roles(EUserRole.ADMIN, EUserRole.RRHH)
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Se ha creado un tipo de contrato.')
  @ApiBody({
    type: CreateContractTypeDto,
    description: 'Datos para crear un tipo de contrato.',
  })
  @ApiCommonResponses({
    summary: 'Crear un tipo de contrato',
    createdDescription: 'Tipo de contrato creado exitosamente.',
    badRequestDescription: 'Datos inválidos para crear el tipo de contrato.',
    internalErrorDescription: 'Error interno al crear el tipo de contrato.',
  })
  create(@Body() createContractTypeDto: CreateContractTypeDto) {
    return this.contractTypesService.create(createContractTypeDto);
  }

  @Get()
  @Roles(
    EUserRole.ADMIN,
    EUserRole.RRHH,
    EUserRole.DIRECCION,
    EUserRole.COORDINADOR_AREA,
    EUserRole.DOCENTE,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de tipos de contrato obtenido correctamente.')
  @ApiCommonResponses({
    summary: 'Obtener todos los tipos de contrato',
    okDescription: 'Listado de tipos de contrato obtenido correctamente.',
    badRequestDescription:
      'Solicitud inválida al obtener los tipos de contrato.',
    internalErrorDescription: 'Error interno al obtener los tipos de contrato.',
    notFoundDescription: 'No se encontraron tipos de contrato.',
  })
  // Si quieres paginación:
  // @ApiPagination({ summary: 'Obtener todos los tipos de contrato', description: 'Devuelve una lista paginada de tipos de contrato.' })
  // findAll(@Query() query: QueryPaginationDto) {
  //   return this.contractTypesService.findAllWithPagination(query);
  // }
  findAll() {
    return this.contractTypesService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Tipo de contrato obtenido correctamente.')
  @ApiCommonResponses({
    summary: 'Obtener un tipo de contrato por ID',
    okDescription: 'Tipo de contrato obtenido correctamente.',
    badRequestDescription: 'ID inválido para obtener el tipo de contrato.',
    internalErrorDescription: 'Error interno al obtener el tipo de contrato.',
    notFoundDescription: 'No se encontró el tipo de contrato solicitado.',
  })
  findOne(@Param('id', ValidateIdPipe) id: string) {
    return this.contractTypesService.findOne(id);
  }

  @Patch(':id')
  @Roles(EUserRole.ADMIN, EUserRole.RRHH)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha actualizado el tipo de contrato.')
  @ApiBody({
    type: UpdateContractTypeDto,
    description: 'Datos para actualizar un tipo de contrato.',
  })
  @ApiCommonResponses({
    summary: 'Actualizar un tipo de contrato por ID',
    okDescription: 'Tipo de contrato actualizado correctamente.',
    badRequestDescription:
      'Datos inválidos para actualizar el tipo de contrato.',
    internalErrorDescription:
      'Error interno al actualizar el tipo de contrato.',
    notFoundDescription: 'No se encontró el tipo de contrato a actualizar.',
  })
  update(
    @Param('id', ValidateIdPipe) id: string,
    @Body() updateContractTypeDto: UpdateContractTypeDto,
  ) {
    return this.contractTypesService.update(id, updateContractTypeDto);
  }

  @Delete(':id')
  @Roles(EUserRole.ADMIN, EUserRole.RRHH)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha eliminado el tipo de contrato.')
  @ApiCommonResponses({
    summary: 'Eliminar un tipo de contrato por ID',
    okDescription: 'Tipo de contrato eliminado correctamente.',
    badRequestDescription: 'ID inválido para eliminar el tipo de contrato.',
    internalErrorDescription: 'Error interno al eliminar el tipo de contrato.',
    notFoundDescription: 'No se encontró el tipo de contrato a eliminar.',
  })
  remove(@Param('id', ValidateIdPipe) id: string) {
    return this.contractTypesService.remove(id);
  }
}
