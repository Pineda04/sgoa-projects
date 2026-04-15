import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCommonResponses,
  ApiPagination,
  GetCurrentUser,
  ResponseMessage,
  Roles,
} from 'src/common/decorators';
import { EUserRole } from 'src/common/enums';
import { ValidateIdPipe } from 'src/common/pipes';
import { ApiBody } from '@nestjs/swagger';
import { TeachersPostgradService } from '../services/teachers-postgrad.service';
import { CreateTeacherPostgradDto } from '../dto';
import { QueryPaginationDto } from 'src/common/dto';
import { TJwtPayload } from 'src/modules/auth/types';

@Controller('teachers-postgrad')
@Roles(
  EUserRole.ADMIN,
  EUserRole.RRHH,
  EUserRole.DIRECCION,
  EUserRole.DOCENTE,
  EUserRole.COORDINADOR_AREA,
)
export class TeachersPostgradController {
  constructor(
    private readonly teachersPostgradService: TeachersPostgradService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Se ha creado la relación docente-postgrado.')
  @ApiBody({
    type: CreateTeacherPostgradDto,
    description: 'Datos para crear una relación docente-postgrado.',
  })
  @ApiCommonResponses({
    summary: 'Crear relación docente-postgrado',
    createdDescription: 'Relación creada exitosamente.',
    badRequestDescription: 'Datos inválidos para crear la relación.',
    internalErrorDescription: 'Error interno al crear la relación.',
  })
  create(
    @Body() createTeachersPostgradDto: CreateTeacherPostgradDto,
    @GetCurrentUser() currentUser: TJwtPayload,
  ) {
    if (
      currentUser.roles.length === 1 &&
      currentUser.roles.includes(EUserRole.DOCENTE) &&
      currentUser.sub !== createTeachersPostgradDto.userId
    )
      throw new ForbiddenException(
        'No tiene permiso para agregar registros a otro usuario.',
      );

    return this.teachersPostgradService.create(createTeachersPostgradDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(
    'Listado de relaciones docente-postgrado obtenidas correctamente.',
  )
  @ApiCommonResponses({
    summary: 'Obtener todas las relaciones docente-postgrado',
    okDescription: 'Listado obtenido correctamente.',
    badRequestDescription: 'Solicitud inválida para obtener las relaciones.',
    internalErrorDescription: 'Error interno al obtener las relaciones.',
    notFoundDescription: 'No se encontraron relaciones.',
  })
  @ApiPagination({
    summary: 'Obtener todas las relaciones docente-postgrado',
    description: 'Devuelve una lista paginada de todos los docente-postgrado.',
  })
  findAll(@Query() query: QueryPaginationDto) {
    return this.teachersPostgradService.findAllWithPagination(query);
  }

  // @Get('array')
  // @HttpCode(HttpStatus.OK)
  // @ResponseMessage('Listado de relaciones docente-postgrado en formato array.')
  // findAllArray() {
  //   return this.teachersPostgradService.findAllArray();
  // }

  // @Get(':id')
  // @HttpCode(HttpStatus.OK)
  // @ResponseMessage('Relación docente-postgrado obtenida correctamente.')
  // @ApiCommonResponses({
  //   summary: 'Obtener relación docente-postgrado por ID',
  //   okDescription: 'Relación obtenida correctamente.',
  //   badRequestDescription: 'ID inválido para obtener la relación.',
  //   internalErrorDescription: 'Error interno al obtener la relación.',
  //   notFoundDescription: 'No se encontró la relación solicitada.',
  // })
  // findOne(@Param('id', ValidateIdPipe) id: string) {
  //   return this.teachersPostgradService.findOne(id);
  // }

  // @Patch(':id')
  // @Roles(EUserRole.ADMIN, EUserRole.RRHH, EUserRole.DIRECCION)
  // @HttpCode(HttpStatus.OK)
  // @ResponseMessage('Relación docente-postgrado actualizada correctamente.')
  // @ApiBody({
  //   type: UpdatePostgradDto,
  //   description: 'Datos para actualizar una relación docente-postgrado.',
  // })
  // @ApiCommonResponses({
  //   summary: 'Actualizar relación docente-postgrado por ID',
  //   okDescription: 'Relación actualizada correctamente.',
  //   badRequestDescription: 'Datos inválidos para actualizar la relación.',
  //   internalErrorDescription: 'Error interno al actualizar la relación.',
  //   notFoundDescription: 'No se encontró la relación a actualizar.',
  // })
  // update(
  //   @Param('userId', ValidateIdPipe) userId: string,
  //   @Param('postgradId', ValidateIdPipe) postgradId: string,
  //   @Body() updateTeachersPostgradDto: UpdatePostgradDto,
  // ) {
  //   return this.teachersPostgradService.update(id, updateTeachersPostgradDto);
  // }

  @Delete('user/:userId/postgrad/:postgradId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Relación docente-postgrado eliminada correctamente.')
  @ApiCommonResponses({
    summary: 'Eliminar relación docente-postgrado por ID',
    okDescription: 'Relación eliminada correctamente.',
    badRequestDescription: 'ID inválido para eliminar la relación.',
    internalErrorDescription: 'Error interno al eliminar la relación.',
    notFoundDescription: 'No se encontró la relación a eliminar.',
  })
  remove(
    @Param('userId', ValidateIdPipe) userId: string,
    @Param('postgradId', ValidateIdPipe) postgradId: string,
    @GetCurrentUser() currentUser: TJwtPayload,
  ) {
    if (
      currentUser.roles.length === 1 &&
      currentUser.roles.includes(EUserRole.DOCENTE) &&
      currentUser.sub !== userId
    )
      throw new ForbiddenException(
        'No tiene permiso para eliminar registros de otro usuario.',
      );

    return this.teachersPostgradService.remove(userId, postgradId);
  }
}
