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
import { ApiParam } from '@nestjs/swagger';
import { ApiBody } from '@nestjs/swagger';
import { ApiCommonResponses } from 'src/common/decorators/api-response.decorator';
import { ResponseMessage, Roles } from 'src/common/decorators';
import { EUserRole } from 'src/common/enums';
import { ValidateIdPipe } from 'src/common/pipes';
import { CreateModalityDto, UpdateModalityDto } from '../dto';
import { ModalitiesService } from '../services/modalities.service';

@Controller('modalities')
export class ModalitiesController {
  constructor(private readonly modalitiesService: ModalitiesService) {}

  @Post()
  @Roles(
    EUserRole.ADMIN,
    EUserRole.DIRECCION,
    EUserRole.RRHH,
    EUserRole.COORDINADOR_AREA,
  )
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Se ha creado una modalidad de curso.')
  @ApiBody({
    type: CreateModalityDto,
    description: 'Datos necesarios para crear una modalidad de curso.',
  })
  @ApiCommonResponses({
    summary: 'Crear una modalidad de curso',
    createdDescription: 'Se ha creado una modalidad de curso.',
    badRequestDescription: 'Datos inválidos para la creación.',
  })
  create(@Body() createModalityDto: CreateModalityDto) {
    return this.modalitiesService.create(createModalityDto);
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
  @ResponseMessage('Listado de modalidades de curso.')
  @ApiCommonResponses({
    summary: 'Obtener todas las modalidades de curso',
    okDescription: 'Listado de modalidades de curso obtenido correctamente.',
  })
  findAll() {
    return this.modalitiesService.findAll();
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
  @ResponseMessage('La información de la modalidad de curso.')
  @ApiParam({
    name: 'id',
    description: 'ID de la modalidad de curso a obtener',
    type: String,
    format: 'uuid',
  })
  @ApiCommonResponses({
    summary: 'Obtener una modalidad de curso por ID',
    okDescription: 'Modalidad de curso obtenida correctamente.',
    notFoundDescription: 'La modalidad de curso no existe.',
  })
  findOne(@Param('id', ValidateIdPipe) id: string) {
    return this.modalitiesService.findOne(id);
  }

  @Patch(':id')
  @Roles(
    EUserRole.ADMIN,
    EUserRole.DIRECCION,
    EUserRole.RRHH,
    EUserRole.COORDINADOR_AREA,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha actualizado la modalidad de curso.')
  @ApiParam({
    name: 'id',
    description: 'ID de la modalidad de curso a actualizar',
    type: String,
    format: 'uuid',
  })
  @ApiBody({ type: UpdateModalityDto })
  @ApiCommonResponses({
    summary: 'Actualizar una modalidad de curso por ID',
    okDescription: 'Modalidad de curso actualizada correctamente.',
    badRequestDescription: 'Datos inválidos para la actualización.',
    notFoundDescription: 'La modalidad de curso no existe.',
  })
  update(
    @Param('id', ValidateIdPipe) id: string,
    @Body() updateModalityDto: UpdateModalityDto,
  ) {
    return this.modalitiesService.update(id, updateModalityDto);
  }

  @Delete(':id')
  @Roles(
    EUserRole.ADMIN,
    EUserRole.DIRECCION,
    EUserRole.RRHH,
    EUserRole.COORDINADOR_AREA,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha eliminado una modalidad de curso.')
  @ApiParam({
    name: 'id',
    description: 'ID de la modalidad de curso a eliminar',
    type: String,
    format: 'uuid',
  })
  @ApiCommonResponses({
    summary: 'Eliminar una modalidad de curso por ID',
    okDescription: 'Modalidad de curso eliminada correctamente.',
    notFoundDescription: 'La modalidad de curso no existe.',
  })
  remove(@Param('id', ValidateIdPipe) id: string) {
    return this.modalitiesService.remove(id);
  }
}
