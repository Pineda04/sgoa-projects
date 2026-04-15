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
import { CreateTeacherUndergradDto } from '../dto';
import { TeachersUndergradService } from '../services/teachers-undergrad.service';
import { QueryPaginationDto } from 'src/common/dto';
import { TJwtPayload } from 'src/modules/auth/types';

@Controller('teachers-undergrad')
@Roles(
  EUserRole.ADMIN,
  EUserRole.RRHH,
  EUserRole.DIRECCION,
  EUserRole.DOCENTE,
  EUserRole.COORDINADOR_AREA,
)
export class TeachersUndergradController {
  constructor(
    private readonly teachersUndergradService: TeachersUndergradService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Se ha creado la relación docente-pregrado.')
  @ApiBody({
    type: CreateTeacherUndergradDto,
    description: 'Datos para crear una relación docente-pregrado.',
  })
  @ApiCommonResponses({
    summary: 'Crear relación docente-pregrado',
    createdDescription: 'Relación creada exitosamente.',
    badRequestDescription: 'Datos inválidos para crear la relación.',
    internalErrorDescription: 'Error interno al crear la relación.',
  })
  create(
    @Body() createTeachersUndergradDto: CreateTeacherUndergradDto,
    @GetCurrentUser() currentUser: TJwtPayload,
  ) {
    if (
      currentUser.roles.length === 1 &&
      currentUser.roles.includes(EUserRole.DOCENTE) &&
      currentUser.sub !== createTeachersUndergradDto.userId
    )
      throw new ForbiddenException(
        'No tiene permiso para eliminar registros de otro usuario.',
      );

    return this.teachersUndergradService.create(createTeachersUndergradDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(
    'Listado de relaciones docente-pregrado obtenidas correctamente.',
  )
  @ApiCommonResponses({
    summary: 'Obtener todas las relaciones docente-pregrado',
    okDescription: 'Listado obtenido correctamente.',
    badRequestDescription: 'Solicitud inválida para obtener las relaciones.',
    internalErrorDescription: 'Error interno al obtener las relaciones.',
    notFoundDescription: 'No se encontraron relaciones.',
  })
  @ApiPagination({
    summary: 'Obtener todas las relaciones docente-pregrado',
    description: 'Devuelve una lista paginada de todos los docente-pregrado.',
  })
  findAll(@Query() query: QueryPaginationDto) {
    return this.teachersUndergradService.findAllWithPagination(query);
  }

  // @Get('array')
  // @HttpCode(HttpStatus.OK)
  // @ResponseMessage('Listado de relaciones docente-pregrado en formato array.')
  // findAllArray() {
  //   return this.teachersUndergradService.findAllArray();
  // }

  // @Get(':id')
  // @HttpCode(HttpStatus.OK)
  // @ResponseMessage('Relación docente-pregrado obtenida correctamente.')
  // @ApiCommonResponses({
  //   summary: 'Obtener relación docente-pregrado por ID',
  //   okDescription: 'Relación obtenida correctamente.',
  //   badRequestDescription: 'ID inválido para obtener la relación.',
  //   internalErrorDescription: 'Error interno al obtener la relación.',
  //   notFoundDescription: 'No se encontró la relación solicitada.',
  // })
  // findOne(@Param('id', ValidateIdPipe) id: string) {
  //   return this.teachersUndergradService.findOne(id);
  // }
  //
  // @Patch(':id')
  // @Roles(EUserRole.ADMIN, EUserRole.RRHH, EUserRole.DIRECCION)
  // @HttpCode(HttpStatus.OK)
  // @ResponseMessage('Relación docente-pregrado actualizada correctamente.')
  // @ApiBody({
  //   type: UpdateUndergradDto,
  //   description: 'Datos para actualizar una relación docente-pregrado.',
  // })
  // @ApiCommonResponses({
  //   summary: 'Actualizar relación docente-pregrado por ID',
  //   okDescription: 'Relación actualizada correctamente.',
  //   badRequestDescription: 'Datos inválidos para actualizar la relación.',
  //   internalErrorDescription: 'Error interno al actualizar la relación.',
  //   notFoundDescription: 'No se encontró la relación a actualizar.',
  // })
  // update(
  //   @Param('id', ValidateIdPipe) id: string,
  //   @Body() updateTeachersUndergradDto: UpdateUndergradDto,
  // ) {
  //   return this.teachersUndergradService.update(id, updateTeachersUndergradDto);
  // }

  @Delete('user/:userId/undergrad/:undergradId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Relación docente-pregrado eliminada correctamente.')
  @ApiCommonResponses({
    summary: 'Eliminar relación docente-pregrado por ID',
    okDescription: 'Relación eliminada correctamente.',
    badRequestDescription: 'ID inválido para eliminar la relación.',
    internalErrorDescription: 'Error interno al eliminar la relación.',
    notFoundDescription: 'No se encontró la relación a eliminar.',
  })
  remove(
    @Param('userId', ValidateIdPipe) userId: string,
    @Param('undergradId', ValidateIdPipe) undergradId: string,
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

    return this.teachersUndergradService.remove(userId, undergradId);
  }
}
