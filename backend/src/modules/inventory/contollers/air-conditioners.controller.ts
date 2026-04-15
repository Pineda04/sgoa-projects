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
import { AirConditionersService } from '../services/air-conditioners.service';
import { CreateAirConditionerDto, UpdateAirConditionerDto } from '../dto';

@Controller('air-conditioners')
@Roles(
  EUserRole.ADMIN,
  EUserRole.DIRECCION,
  EUserRole.RRHH,
  EUserRole.COORDINADOR_AREA,
)
export class AirConditionersController {
  constructor(
    private readonly airConditionersService: AirConditionersService,
  ) {}

  @Post()
  @Roles(EUserRole.ADMIN, EUserRole.DIRECCION, EUserRole.RRHH)
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Se ha creado un aire acondicionado.')
  @ApiBody({
    type: CreateAirConditionerDto,
    description: 'Datos para crear un aire acondicionado',
    required: true,
  })
  @ApiCommonResponses({
    summary: 'Crear aire acondicionado',
    createdDescription: 'Aire acondicionado creado correctamente.',
  })
  create(@Body() createAirConditionerDto: CreateAirConditionerDto) {
    return this.airConditionersService.create(createAirConditionerDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de aires acondicionados.')
  @ApiCommonResponses({
    summary: 'Listar aires acondicionados',
    okDescription: 'Listado de aires acondicionados.',
  })
  findAll() {
    return this.airConditionersService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Aire acondicionado obtenido.')
  @ApiCommonResponses({
    summary: 'Obtener aire acondicionado',
    okDescription: 'Aire acondicionado obtenido.',
    notFoundDescription: 'No se encontró el aire acondicionado solicitado.',
  })
  findOne(@Param('id', ValidateIdPipe) id: string) {
    return this.airConditionersService.findOne(id);
  }

  @Patch(':id')
  @Roles(EUserRole.ADMIN, EUserRole.DIRECCION, EUserRole.RRHH)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Aire acondicionado actualizado.')
  @ApiBody({
    type: UpdateAirConditionerDto,
    description: 'Datos para actualizar un aire acondicionado',
    required: true,
  })
  @ApiCommonResponses({
    summary: 'Actualizar aire acondicionado',
    okDescription: 'Aire acondicionado actualizado.',
    notFoundDescription: 'No se encontró el aire acondicionado solicitado.',
  })
  update(
    @Param('id', ValidateIdPipe) id: string,
    @Body() updateAirConditionerDto: UpdateAirConditionerDto,
  ) {
    return this.airConditionersService.update(id, updateAirConditionerDto);
  }

  @Delete(':id')
  @Roles(EUserRole.ADMIN, EUserRole.DIRECCION, EUserRole.RRHH)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Aire acondicionado eliminado.')
  @ApiCommonResponses({
    summary: 'Eliminar aire acondicionado',
    okDescription: 'Aire acondicionado eliminado.',
    notFoundDescription: 'No se encontró el aire acondicionado solicitado.',
  })
  remove(@Param('id', ValidateIdPipe) id: string) {
    return this.airConditionersService.remove(id);
  }
}
