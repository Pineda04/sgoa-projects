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
import { CreateUndergradDto } from '../dto/create-undergrad.dto';
import { UpdateUndergradDto } from '../dto/update-undergrad.dto';
import { UndergradsService } from '../services/undergrads.service';
import { EUserRole } from 'src/common/enums';
import {
  ApiCommonResponses,
  ResponseMessage,
  Roles,
} from 'src/common/decorators';
import { ValidateIdPipe } from 'src/common/pipes';
import { ApiBody } from '@nestjs/swagger';

@Controller('undergrads')
@Roles(
  EUserRole.ADMIN,
  EUserRole.RRHH,
  EUserRole.DIRECCION,
  EUserRole.DOCENTE,
  EUserRole.COORDINADOR_AREA,
)
export class UndergradsController {
  constructor(private readonly undergradsService: UndergradsService) {}

  @Post()
  @Roles(EUserRole.ADMIN, EUserRole.RRHH, EUserRole.DIRECCION)
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Se ha creado un pregrado.')
  @ApiBody({
    type: CreateUndergradDto,
    description: 'Datos para crear un pregrado.',
  })
  @ApiCommonResponses({
    summary: 'Crear un pregrado',
    createdDescription: 'Pregrado creado exitosamente.',
    badRequestDescription: 'Datos inválidos para crear el pregrado.',
    internalErrorDescription: 'Error interno al crear el pregrado.',
  })
  create(@Body() createUndergradDto: CreateUndergradDto) {
    return this.undergradsService.create(createUndergradDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de pregrados.')
  // @ApiPagination({
  //   summary: 'Obtener todos los pregrados',
  //   description: 'Devuelve una lista paginada de todos los pregrados.',
  // })
  @ApiCommonResponses({
    summary: 'Obtener todos los pregrados',
    okDescription: 'Listado de pregrados obtenido correctamente.',
    badRequestDescription: 'Solicitud inválida al obtener los pregrados.',
    internalErrorDescription: 'Error interno al obtener los pregrados.',
    notFoundDescription: 'No se encontraron pregrados.',
  })
  findAll() {
    // @Query() query: QueryPaginationDto
    return this.undergradsService.findAll();
  }

  @Get('array')
  @Roles(EUserRole.ADMIN, EUserRole.RRHH, EUserRole.DIRECCION)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de pregrados en arreglo.')
  @ApiCommonResponses({
    summary: 'Obtener pregrados como arreglo',
    okDescription: 'Pregrados obtenidos correctamente como arreglo.',
    badRequestDescription: 'Solicitud inválida al obtener pregrados.',
    internalErrorDescription: 'Error interno al obtener pregrados.',
    notFoundDescription: 'No se encontraron pregrados.',
  })
  findAllArray() {
    return this.undergradsService.findAllArray();
  }

  @Get(':id')
  @Roles(EUserRole.ADMIN, EUserRole.RRHH, EUserRole.DIRECCION)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Información de un pregrado.')
  @ApiCommonResponses({
    summary: 'Obtener un pregrado por ID',
    okDescription: 'Pregrado obtenido correctamente.',
    badRequestDescription: 'ID inválido para obtener el pregrado.',
    internalErrorDescription: 'Error interno al obtener el pregrado.',
    notFoundDescription: 'No se encontró el pregrado solicitado.',
  })
  findOne(@Param('id', ValidateIdPipe) id: string) {
    return this.undergradsService.findOne(id);
  }

  @Patch(':id')
  @Roles(EUserRole.ADMIN, EUserRole.RRHH, EUserRole.DIRECCION)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha actualizado el pregrado.')
  @ApiBody({
    type: UpdateUndergradDto,
    description: 'Datos para actualizar un pregrado.',
  })
  @ApiCommonResponses({
    summary: 'Actualizar un pregrado por ID',
    okDescription: 'Pregrado actualizado correctamente.',
    badRequestDescription: 'Datos inválidos para actualizar el pregrado.',
    internalErrorDescription: 'Error interno al actualizar el pregrado.',
    notFoundDescription: 'No se encontró el pregrado a actualizar.',
  })
  update(
    @Param('id', ValidateIdPipe) id: string,
    @Body() updateUndergradDto: UpdateUndergradDto,
  ) {
    return this.undergradsService.update(id, updateUndergradDto);
  }

  @Delete(':id')
  @Roles(EUserRole.ADMIN, EUserRole.RRHH, EUserRole.DIRECCION)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha eliminado el pregrado.')
  @ApiCommonResponses({
    summary: 'Eliminar un pregrado por ID',
    okDescription: 'Pregrado eliminado correctamente.',
    badRequestDescription: 'ID inválido para eliminar el pregrado.',
    internalErrorDescription: 'Error interno al eliminar el pregrado.',
    notFoundDescription: 'No se encontró el pregrado a eliminar.',
  })
  remove(@Param('id', ValidateIdPipe) id: string) {
    return this.undergradsService.remove(id);
  }
}
