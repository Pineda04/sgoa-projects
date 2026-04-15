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
import { ValidateIdPipe } from 'src/common/pipes';
import { CreateBuildingDto, UpdateBuildingDto } from '../dto';
import {
  ApiCommonResponses,
  ResponseMessage,
  Roles,
} from 'src/common/decorators';
import { EUserRole } from 'src/common/enums';
import { BuildingService } from '../services/building.service';
import { ApiBody } from '@nestjs/swagger';

@Controller('buildings')
@Roles(
  EUserRole.ADMIN,
  EUserRole.DIRECCION,
  EUserRole.RRHH,
  EUserRole.COORDINADOR_AREA,
)
export class BuildingController {
  constructor(private readonly buildingService: BuildingService) {}

  @Post()
  @Roles(EUserRole.ADMIN, EUserRole.DIRECCION, EUserRole.RRHH)
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Se ha creado un edificio.')
  @ApiBody({ type: CreateBuildingDto })
  @ApiCommonResponses({
    summary: 'Crear un edificio',
    createdDescription: 'Edificio creado exitosamente.',
    badRequestDescription: 'Datos inválidos para crear el edificio.',
    internalErrorDescription: 'Error interno al crear el edificio.',
  })
  create(@Body() createBuildingDto: CreateBuildingDto) {
    return this.buildingService.create(createBuildingDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de edificios.')
  @ApiCommonResponses({
    summary: 'Obtener todos los edificios',
    okDescription: 'Listado de edificios obtenido correctamente.',
  })
  findAll() {
    return this.buildingService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Información del edificio.')
  @ApiCommonResponses({
    summary: 'Obtener un edificio por ID',
    okDescription: 'Edificio obtenido correctamente.',
    notFoundDescription: 'El edificio no existe.',
  })
  findOne(@Param('id', ValidateIdPipe) id: string) {
    return this.buildingService.findOne(id);
  }

  @Patch(':id')
  @Roles(EUserRole.ADMIN, EUserRole.DIRECCION, EUserRole.RRHH)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha actualizado el edificio.')
  @ApiBody({ type: UpdateBuildingDto })
  @ApiCommonResponses({
    summary: 'Actualizar un edificio por ID',
    okDescription: 'Edificio actualizado correctamente.',
    badRequestDescription: 'Datos inválidos para la actualización.',
    notFoundDescription: 'El edificio no existe.',
  })
  update(
    @Param('id', ValidateIdPipe) id: string,
    @Body() updateBuildingDto: UpdateBuildingDto,
  ) {
    return this.buildingService.update(id, updateBuildingDto);
  }

  @Delete(':id')
  @Roles(EUserRole.ADMIN, EUserRole.DIRECCION, EUserRole.RRHH)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Se ha eliminado el edificio.')
  @ApiCommonResponses({
    summary: 'Eliminar un edificio por ID',
    okDescription: 'Edificio eliminado correctamente.',
    notFoundDescription: 'El edificio no existe.',
  })
  remove(@Param('id', ValidateIdPipe) id: string) {
    return this.buildingService.remove(id);
  }
}
