import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { TRole } from '../types';
import { EUserRole } from 'src/common/enums';

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

    // if (roles.length === 0)
    //   throw new NotFoundException('No se encontraron datos.'); // tambien se puede devolver un 200 como consulta exitosa pero con data []

    return roles;
  }

  async findManyByNames(names: EUserRole[]): Promise<TRole[]> {
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

    // throw new HttpException(
    //   `El rol con id <${id}> no fue encontrado.`,
    //   HttpStatus.NOT_FOUND,
    // );

    return role;
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

    // throw new HttpException(
    //   `El rol con id <${id}> no fue encontrado.`,
    //   HttpStatus.NOT_FOUND,
    // );

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

  async remove(id: string): Promise<TRole> {
    const roleDelete = await this.prisma.role.delete({
      where: {
        id,
      },
    });

    return roleDelete;
  }
}
