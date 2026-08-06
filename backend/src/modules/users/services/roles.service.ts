import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { UpdateRolePermissionsDto } from '../dto/update-role-permissions.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { TPermissionsCatalog, TRole, TRoleWithPermissions } from '../types';
import {
  NON_ASSIGNABLE_SUBJECTS,
  PERMISSION_SUBJECTS,
  SUBJECT_IMPLIED_PERMISSIONS,
} from 'src/common/constants';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto): Promise<TRole> {
    const newRole = await this.prisma.role.create({
      data: {
        ...createRoleDto,
      },
    });

    return newRole;
  }

  async findAll(): Promise<TRole[]> {
    const roles = await this.prisma.role.findMany();

    return roles;
  }

  async findManyByNames(names: string[]): Promise<TRole[]> {
    const roles = await this.prisma.role.findMany({
      where: { name: { in: names } },
    });

    if (roles.length === 0)
      throw new BadRequestException(
        `No se encontraron roles con los nombres: ${names.join(', ')}.`,
      );

    return roles;
  }

  async findOne(id: string): Promise<TRole> {
    const role = await this.prisma.role.findUnique({
      where: {
        id,
      },
    });

    if (!role)
      throw new NotFoundException(`El rol con id <${id}> no fue encontrado.`);

    return role;
  }

  async findOneWithPermissions(id: string): Promise<TRoleWithPermissions> {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: { include: { permission: true } },
      },
    });

    if (!role)
      throw new NotFoundException(`El rol con id <${id}> no fue encontrado.`);

    const { rolePermissions, ...roleData } = role;

    return {
      ...roleData,
      permissions: rolePermissions.map((rp) => rp.permission),
    };
  }

  async findOneByName(name: string): Promise<TRole> {
    const role = await this.prisma.role.findUnique({
      where: {
        name,
      },
    });

    if (!role)
      throw new NotFoundException(
        `El rol con nombre <${name}> no fue encontrado.`,
      );

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<TRole> {
    const roleUpdate = await this.prisma.role.update({
      where: {
        id,
      },
      data: {
        ...updateRoleDto,
      },
    });

    return roleUpdate;
  }

  async findAllPermissions(): Promise<TPermissionsCatalog> {
    // El catálogo del código manda: la siembra usa skipDuplicates y no poda, así
    // que la tabla puede conservar filas de módulos que dejaron de ser
    // asignables (inicio, ayuda y perfil, hoy implícitos para todos).
    const assignableSubjects = PERMISSION_SUBJECTS.filter(
      (subject) => !NON_ASSIGNABLE_SUBJECTS.includes(subject),
    );
    const permissions = await this.prisma.permission.findMany({
      where: { subject: { in: assignableSubjects } },
    });

    return {
      permissions,
      impliedPermissions: SUBJECT_IMPLIED_PERMISSIONS,
    };
  }

  async updatePermissions(
    roleId: string,
    { permissionIds }: UpdateRolePermissionsDto,
  ): Promise<TRole> {
    const role = await this.findOne(roleId);

    if (role.isSuperAdmin)
      throw new ForbiddenException(
        'El rol de super administrador no gestiona permisos mediante la matriz: su acceso es total por definición.',
      );

    await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({ where: { roleId } }),
      this.prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
        skipDuplicates: true,
      }),
    ]);

    return role;
  }

  async remove(id: string): Promise<TRole> {
    const role = await this.findOne(id);

    if (role.isSuperAdmin)
      throw new ForbiddenException(
        'El rol de super administrador es protegido y no puede eliminarse.',
      );

    const assignedUsersCount = await this.prisma.userRole.count({
      where: { roleId: id },
    });

    if (assignedUsersCount > 0)
      throw new BadRequestException(
        `No se puede eliminar el rol <${role.name}> porque tiene ${assignedUsersCount} usuario(s) asignado(s).`,
      );

    const roleDelete = await this.prisma.role.delete({
      where: {
        id,
      },
    });

    return roleDelete;
  }
}
