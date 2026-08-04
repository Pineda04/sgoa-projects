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
  forwardRef,
  Inject,
  ForbiddenException,
  Query,
  Put,
} from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { ApiCommonResponses } from 'src/common/decorators/api-response.decorator';
import {
  ApiPagination,
  GetCurrentUser,
  GetCurrentUserId,
  ResponseMessage,
} from 'src/common/decorators';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ValidateIdPipe } from 'src/common/pipes';
import { Roles } from 'src/common/decorators';
import { EUserRole } from '../../../common/enums';
import { TeachersService } from 'src/modules/teachers/services/teachers.service';
import { TJwtPayload } from 'src/modules/auth/types';
import { QueryPaginationDto } from 'src/common/dto';
import { SetMonitorBuildingAssignmentsDto } from '../dto/set-monitor-building-assignments.dto';
import { UpdateMyUserDto } from '../dto/update-my-user.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => TeachersService))
    private readonly teachersService: TeachersService,
  ) {}

  @Post()
  @Roles(EUserRole.ADMIN, EUserRole.COORDINADOR_AREA, EUserRole.RRHH)
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Usuario creado exitosamente. Por favor, revise su correo.')
  @ApiBody({
    type: CreateUserDto,
    description: 'Datos para crear usuario',
    required: true,
  })
  @ApiCommonResponses({
    summary: 'Crear usuario',
    description: 'Crea un nuevo usuario en el sistema.',
    createdDescription: 'Usuario creado exitosamente.',
    badRequestDescription: 'Datos inválidos para la creación del usuario.',
    internalErrorDescription: 'Error interno al crear el usuario.',
  })
  create(
    @Body() createUserDto: CreateUserDto,
    @GetCurrentUser() currentUser: TJwtPayload,
  ) {
    const allowedRoles = currentUser.roles.includes(EUserRole.ADMIN)
      ? new Set(Object.values(EUserRole))
      : currentUser.roles.includes(EUserRole.RRHH)
        ? new Set([EUserRole.DOCENTE, EUserRole.COORDINADOR_AREA])
        : new Set([EUserRole.DOCENTE]);
    const requestedRoles = createUserDto.roles.length
      ? createUserDto.roles
      : [EUserRole.DOCENTE];

    if (requestedRoles.some((role) => !allowedRoles.has(role))) {
      throw new ForbiddenException(
        'No tiene permiso para asignar uno o más de los roles solicitados.',
      );
    }

    return this.usersService.createUserWithDeptAndPosition(
      createUserDto,
      currentUser,
    );
  }

  @Get()
  @Roles(
    EUserRole.ADMIN,
    EUserRole.COORDINADOR_AREA,
    EUserRole.DIRECCION,
    EUserRole.RRHH,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de usuarios.')
  @ApiCommonResponses({
    summary: 'Listar usuarios',
    description: 'Obtiene la lista de todos los usuarios registrados.',
    okDescription: 'Lista de usuarios obtenida correctamente.',
    internalErrorDescription: 'Error interno al obtener los usuarios.',
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('one/:id')
  @Roles(
    EUserRole.ADMIN,
    EUserRole.COORDINADOR_AREA,
    EUserRole.DIRECCION,
    EUserRole.RRHH,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Información de usuario obtenida.')
  @ApiCommonResponses({
    summary: 'Obtener usuario por ID',
    description: 'Obtiene la información de un usuario específico por su ID.',
    okDescription: 'Usuario obtenido correctamente.',
    internalErrorDescription: 'Error interno al obtener el usuario.',
    notFoundDescription: 'No se encontró el usuario solicitado.',
  })
  findOne(@Param('id', ValidateIdPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Get('code/:code')
  @Roles(
    EUserRole.ADMIN,
    EUserRole.COORDINADOR_AREA,
    EUserRole.DIRECCION,
    EUserRole.RRHH,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Información de usuario obtenida por código.')
  @ApiCommonResponses({
    summary: 'Obtener usuario por código',
    description:
      'Obtiene la información de un usuario específico por su código.',
    okDescription: 'Usuario obtenido correctamente.',
    internalErrorDescription: 'Error interno al obtener el usuario.',
    notFoundDescription: 'No se encontró el usuario solicitado.',
  })
  findOneByCode(@Param('code') code: string) {
    return this.teachersService.findOneByCode(code);
  }

  @Get('role/:id')
  @Roles(
    EUserRole.ADMIN,
    EUserRole.COORDINADOR_AREA,
    EUserRole.DIRECCION,
    EUserRole.RRHH,
  )
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de usuarios por rol obtenido.')
  @ApiCommonResponses({
    summary: 'Listar usuarios por rol',
    description: 'Obtiene la lista de usuarios según el rol especificado.',
    okDescription: 'Lista de usuarios por rol obtenida correctamente.',
    internalErrorDescription: 'Error interno al obtener los usuarios por rol.',
    notFoundDescription: 'No se encontraron usuarios para el rol especificado.',
  })
  findAllUsersWithRole(@Param('roleId', ValidateIdPipe) roleId: string) {
    return this.usersService.findAllUsersWithRole(roleId);
  }

  @Get('search')
  @Roles(EUserRole.ADMIN, EUserRole.RRHH, EUserRole.DIRECCION)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de usuarios encontrado correctamente.')
  @ApiCommonResponses({
    summary: 'Buscar usuarios por término',
    okDescription:
      'Retorna un listado paginado de docentes que coinciden con el término de búsqueda.',
  })
  @ApiPagination({
    summary: 'Búsqueda de usuario',
    description:
      'Permite buscar usuarios utilizando un término (nombre, código y correo) y obtener los resultados de forma paginada.',
  })
  findBySearchTerm(
    @Query('searchTerm') searchTerm: string,
    @Query() query: QueryPaginationDto,
  ) {
    return this.usersService.findBySearchTerm(searchTerm, query);
  }

  @Patch('my')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Usuario actualizado correctamente.')
  @ApiBody({
    type: UpdateMyUserDto,
    description: 'Datos para actualizar usuario autenticado',
    required: true,
  })
  @ApiCommonResponses({
    summary: 'Actualizar usuario autenticado',
    description: 'Actualiza la información de un usuario existente.',
    internalErrorDescription: 'Error interno al actualizar el usuario.',
    notFoundDescription: 'No se encontró el usuario solicitado.',
  })
  updateMy(
    @GetCurrentUserId() userId: string,
    @Body() updateUserDto: UpdateMyUserDto,
  ) {
    return this.usersService.update(userId, updateUserDto);
  }

  @Get(':id/monitor-buildings')
  @Roles(EUserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Asignaciones de edificios obtenidas correctamente.')
  findMonitorBuildingAssignments(@Param('id', ValidateIdPipe) id: string) {
    return this.usersService.findMonitorBuildingAssignments(id);
  }

  @Put(':id/monitor-buildings')
  @Roles(EUserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Asignaciones de edificios actualizadas correctamente.')
  replaceMonitorBuildingAssignments(
    @Param('id', ValidateIdPipe) id: string,
    @Body() dto: SetMonitorBuildingAssignmentsDto,
  ) {
    return this.usersService.replaceMonitorBuildingAssignments(
      id,
      dto.buildingIds,
    );
  }

  @Patch(':id')
  @Roles(EUserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Usuario actualizado correctamente.')
  @ApiBody({
    type: UpdateUserDto,
    description: 'Datos para actualizar usuario',
    required: true,
  })
  @ApiCommonResponses({
    summary: 'Actualizar usuario',
    description: 'Actualiza la información de un usuario existente.',
    internalErrorDescription: 'Error interno al actualizar el usuario.',
    notFoundDescription: 'No se encontró el usuario solicitado.',
  })
  update(
    @Param('id', ValidateIdPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  // No se elimina, solo se desactiva
  @Delete(':id')
  @Roles(EUserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Usuario eliminado correctamente.')
  @ApiCommonResponses({
    summary: 'Eliminar usuario',
    description: 'Elimina un usuario del sistema por su ID.',
    internalErrorDescription: 'Error interno al eliminar el usuario.',
    notFoundDescription: 'No se encontró el usuario solicitado.',
  })
  remove(@Param('id', ValidateIdPipe) id: string) {
    return this.usersService.remove(id);
  }
}
