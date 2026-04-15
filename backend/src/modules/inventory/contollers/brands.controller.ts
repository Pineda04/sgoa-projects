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
import { CreateBrandDto, UpdateBrandDto } from '../dto';
import { BrandsService } from '../services/brands.service';

@Controller('brands')
@Roles(
  EUserRole.ADMIN,
  EUserRole.DIRECCION,
  EUserRole.RRHH,
  EUserRole.COORDINADOR_AREA,
)
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @Roles(EUserRole.ADMIN, EUserRole.DIRECCION, EUserRole.RRHH)
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Marca creada exitosamente.')
  @ApiBody({
    type: CreateBrandDto,
    description: 'Datos para crear una marca',
    required: true,
  })
  @ApiCommonResponses({
    summary: 'Crear marca',
    createdDescription: 'Marca creada correctamente.',
  })
  create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandsService.create(createBrandDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de marcas.')
  @ApiCommonResponses({
    summary: 'Listar marcas',
    okDescription: 'Listado de marcas.',
  })
  findAll() {
    return this.brandsService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Marca obtenida.')
  @ApiCommonResponses({
    summary: 'Obtener marca',
    okDescription: 'Marca obtenida.',
    notFoundDescription: 'No se encontró la marca solicitada.',
  })
  findOne(@Param('id', ValidateIdPipe) id: string) {
    return this.brandsService.findOne(id);
  }

  @Patch(':id')
  @Roles(EUserRole.ADMIN, EUserRole.DIRECCION, EUserRole.RRHH)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Marca actualizada.')
  @ApiBody({
    type: UpdateBrandDto,
    description: 'Datos para actualizar una marca',
    required: true,
  })
  @ApiCommonResponses({
    summary: 'Actualizar marca',
    okDescription: 'Marca actualizada.',
    notFoundDescription: 'No se encontró la marca solicitada.',
  })
  update(
    @Param('id', ValidateIdPipe) id: string,
    @Body() updateBrandDto: UpdateBrandDto,
  ) {
    return this.brandsService.update(id, updateBrandDto);
  }

  @Delete(':id')
  @Roles(EUserRole.ADMIN, EUserRole.DIRECCION, EUserRole.RRHH)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Marca eliminada.')
  @ApiCommonResponses({
    summary: 'Eliminar marca',
    okDescription: 'Marca eliminada.',
    notFoundDescription: 'No se encontró la marca solicitada.',
  })
  remove(@Param('id', ValidateIdPipe) id: string) {
    return this.brandsService.remove(id);
  }
}
