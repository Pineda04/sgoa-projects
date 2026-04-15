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
import { CreatePostgradDto } from '../dto/create-postgrad.dto';
import { UpdatePostgradDto } from '../dto/update-postgrad.dto';
import { PostgradsService } from '../services/postgrads.service';
import { EUserRole } from 'src/common/enums';
import {
  ApiCommonResponses,
  ResponseMessage,
  Roles,
} from 'src/common/decorators';
import { ValidateIdPipe } from 'src/common/pipes';

@Controller('postgrads')
@Roles(
  EUserRole.ADMIN,
  EUserRole.RRHH,
  EUserRole.DIRECCION,
  EUserRole.DOCENTE,
  EUserRole.COORDINADOR_AREA,
)
export class PostgradsController {
  constructor(private readonly postgradsService: PostgradsService) {}

  @Post()
  @Roles(EUserRole.ADMIN, EUserRole.RRHH, EUserRole.DIRECCION)
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Se ha creado un postgrado.')
  @ApiCommonResponses({
    summary: 'Crear un postgrado',
    createdDescription: 'Postgrado creado exitosamente.',
    badRequestDescription: 'Datos inválidos para crear postgrado.',
    internalErrorDescription: 'Error interno al crear postgrado.',
  })
  create(@Body() createPostgradDto: CreatePostgradDto) {
    return this.postgradsService.create(createPostgradDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de postgrados obtenidos correctamente.')
  // @ApiPagination({
  //   summary: 'Obtener todos los postgrados',
  //   description: 'Devuelve una lista paginada de todos los postgrados.',
  // })
  @ApiCommonResponses({
    summary: 'Obtener todos los postgrados',
    okDescription: 'Listado de postgrados obtenido correctamente.',
    badRequestDescription: 'Solicitud inválida al obtener postgrados.',
    internalErrorDescription: 'Error interno al obtener postgrados.',
    notFoundDescription: 'No se encontraron postgrados.',
  })
  findAll() {
    // query: QueryPaginationDto
    return this.postgradsService.findAll();
  }

  @Get('array')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de postgrados en array.')
  findAllArray() {
    return this.postgradsService.findAllArray();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Postgrado obtenido correctamente.')
  @ApiCommonResponses({
    summary: 'Obtener postgrado por ID',
    okDescription: 'Postgrado obtenido correctamente.',
    badRequestDescription: 'ID inválido para obtener postgrado.',
    internalErrorDescription: 'Error interno al obtener postgrado.',
    notFoundDescription: 'No se encontró el postgrado solicitado.',
  })
  findOne(@Param('id', ValidateIdPipe) id: string) {
    return this.postgradsService.findOne(id);
  }

  @Patch(':id')
  @Roles(EUserRole.ADMIN, EUserRole.RRHH, EUserRole.DIRECCION)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Postgrado actualizado correctamente.')
  @ApiCommonResponses({
    summary: 'Actualizar postgrado por ID',
    okDescription: 'Postgrado actualizado correctamente.',
    badRequestDescription: 'Datos inválidos para actualizar postgrado.',
    internalErrorDescription: 'Error interno al actualizar postgrado.',
    notFoundDescription: 'No se encontró el postgrado a actualizar.',
  })
  update(
    @Param('id', ValidateIdPipe) id: string,
    @Body() updatePostgradDto: UpdatePostgradDto,
  ) {
    return this.postgradsService.update(id, updatePostgradDto);
  }

  @Delete(':id')
  @Roles(EUserRole.ADMIN, EUserRole.RRHH, EUserRole.DIRECCION)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Postgrado eliminado correctamente.')
  @ApiCommonResponses({
    summary: 'Eliminar postgrado por ID',
    okDescription: 'Postgrado eliminado correctamente.',
    badRequestDescription: 'ID inválido para eliminar postgrado.',
    internalErrorDescription: 'Error interno al eliminar postgrado.',
    notFoundDescription: 'No se encontró el postgrado a eliminar.',
  })
  remove(@Param('id', ValidateIdPipe) id: string) {
    return this.postgradsService.remove(id);
  }
}
