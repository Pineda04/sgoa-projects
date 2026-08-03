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
import { ApiCommonResponses } from 'src/common/decorators/api-response.decorator';
import { ResponseMessage } from 'src/common/decorators';
import { RolesService } from '../services/roles.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { UpdateRolePermissionsDto } from '../dto/update-role-permissions.dto';
import { ValidateIdPipe } from 'src/common/pipes';
import { RequirePermission, SuperAdminOnly } from 'src/common/decorators';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @SuperAdminOnly()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Rol creado exitosamente.')
  @ApiBody({
    type: CreateRoleDto,
    description: 'Datos para crear rol',
    required: true,
  })
  @ApiCommonResponses({
    summary: 'Crear rol',
    description: 'Crea un nuevo rol en el sistema.',
    createdDescription: 'Rol creado exitosamente.',
    badRequestDescription: 'Datos inválidos para la creación del rol.',
    internalErrorDescription: 'Error interno al crear el rol.',
  })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @RequirePermission('read', 'users')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Listado de roles.')
  @ApiCommonResponses({
    summary: 'Listar roles',
    description: 'Obtiene la lista de todos los roles registrados.',
    okDescription: 'Lista de roles obtenida correctamente.',
    internalErrorDescription: 'Error interno al obtener los roles.',
  })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get('permissions/catalog')
  @SuperAdminOnly()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Catálogo de permisos.')
  @ApiCommonResponses({
    summary: 'Obtener catálogo de permisos',
    description:
      'Obtiene el catálogo completo de permisos (acción × módulo) disponible para armar roles.',
    okDescription: 'Catálogo de permisos obtenido correctamente.',
    internalErrorDescription: 'Error interno al obtener el catálogo de permisos.',
  })
  findAllPermissions() {
    return this.rolesService.findAllPermissions();
  }

  @Get(':id')
  @SuperAdminOnly()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Información del rol obtenida.')
  @ApiCommonResponses({
    summary: 'Obtener rol por ID',
    description: 'Obtiene la información de un rol específico por su ID.',
    okDescription: 'Rol obtenido correctamente.',
    internalErrorDescription: 'Error interno al obtener el rol.',
    notFoundDescription: 'No se encontró el rol solicitado.',
  })
  findOne(@Param('id', ValidateIdPipe) id: string) {
    return this.rolesService.findOneWithPermissions(id);
  }

  @Patch(':id')
  @SuperAdminOnly()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Rol actualizado correctamente.')
  @ApiBody({
    type: UpdateRoleDto,
    description: 'Datos para actualizar rol',
    required: true,
  })
  @ApiCommonResponses({
    summary: 'Actualizar rol',
    description: 'Actualiza la información de un rol existente.',
    internalErrorDescription: 'Error interno al actualizar el rol.',
    notFoundDescription: 'No se encontró el rol solicitado.',
  })
  update(
    @Param('id', ValidateIdPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Patch(':id/permissions')
  @SuperAdminOnly()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Permisos del rol actualizados correctamente.')
  @ApiBody({
    type: UpdateRolePermissionsDto,
    description: 'Set completo de permisos que tendrá el rol',
    required: true,
  })
  @ApiCommonResponses({
    summary: 'Actualizar permisos de un rol',
    description:
      'Reemplaza el set de permisos asignado a un rol (no aplica al rol de super administrador).',
    internalErrorDescription: 'Error interno al actualizar los permisos del rol.',
    notFoundDescription: 'No se encontró el rol solicitado.',
  })
  updatePermissions(
    @Param('id', ValidateIdPipe) id: string,
    @Body() updateRolePermissionsDto: UpdateRolePermissionsDto,
  ) {
    return this.rolesService.updatePermissions(id, updateRolePermissionsDto);
  }

  @Delete(':id')
  @SuperAdminOnly()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Rol eliminado correctamente.')
  @ApiCommonResponses({
    summary: 'Eliminar rol',
    description: 'Elimina un rol del sistema por su ID.',
    internalErrorDescription: 'Error interno al eliminar el rol.',
    notFoundDescription: 'No se encontró el rol solicitado.',
  })
  remove(@Param('id', ValidateIdPipe) id: string) {
    return this.rolesService.remove(id);
  }
}
