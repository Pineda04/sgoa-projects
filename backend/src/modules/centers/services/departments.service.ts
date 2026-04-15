import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { UpdateDepartmentDto } from '../dto/update-department.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { TCenter, TCenterDepartmentJoin, TDepartment } from '../types';
import { TUser } from 'src/modules/users/types';
import { TCustomPick } from 'src/common/types';
import { EPosition } from 'src/modules/teachers-config/enums';
import { TPosition } from 'src/modules/teachers-config/types';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<TDepartment> {
    // Pueden crear pero no necesariamente agregar de primeras a un departamento
    const newDepartment = await this.prisma.department.create({
      data: {
        ...createDepartmentDto,
      },
    });

    return newDepartment;
  }

  async findAll(): Promise<TDepartment[]> {
    const departments = await this.prisma.department.findMany();

    if (departments.length === 0)
      throw new NotFoundException('No se encontraron datos de departamentos.'); // tambien se puede devolver un 200 como consulta exitosa pero con data []

    return departments;
  }

  async findAllWithCoordinators() {
    const departments = await this.prisma.department.findMany({
      include: {
        faculty: true, // opcional
        centers: {
          include: {
            center: true,
            teacherAppointments: {
              where: {
                position: {
                  name: {
                    contains: EPosition.DEPARTMENT_HEAD,
                    // equals: EPosition.DEPARTMENT_HEAD,
                  },
                },
                endDate: null,
              },
              // take: 1,
              include: {
                teacher: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        code: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const result = departments.map((dept) => {
      const coordinations = dept.centers
        .flatMap((cd) =>
          cd.teacherAppointments.map((appointment) => ({
            centerDepartmentId: cd.id,
            centerId: cd.center.id,
            centerName: cd.center.name,
            coordinator: {
              teacherId: appointment.teacher.id,
              userId: appointment.teacher.user.id,
              name: appointment.teacher.user.name,
              code: appointment.teacher.user.code,
            },
          })),
        )
        .filter(Boolean);

      return {
        id: dept.id,
        name: dept.name,
        uvs: dept.uvs,
        facultyId: dept.facultyId,
        // facultyName: dept.faculty?.name,
        coordinations,
      };
    });

    return result;
  }

  async findOne(id: string): Promise<TDepartment> {
    const department = await this.prisma.department.findUnique({
      where: {
        id,
      },
    });

    if (!department)
      throw new NotFoundException(
        `El departamento con id <${id}> no fue encontrado.`,
      );

    // throw new HttpException(
    //   `El departamento con id <${id}> no fue encontrado.`,
    //   HttpStatus.NOT_FOUND,
    // );

    return department;
  }

  async findOneByName(name: string): Promise<TDepartment> {
    const department = await this.prisma.department.findUnique({
      where: {
        name,
      },
    });

    if (!department)
      throw new NotFoundException(
        `El departamento con nombre <${name}> no fue encontrado.`,
      );

    // throw new HttpException(
    //   `El departamento con id <${id}> no fue encontrado.`,
    //   HttpStatus.NOT_FOUND,
    // );

    return department;
  }

  async update(
    id: string,
    updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<TDepartment> {
    const departmentUpdate = await this.prisma.department.update({
      where: {
        id,
      },
      data: {
        ...updateDepartmentDto,
      },
    });

    return departmentUpdate;
  }

  async remove(id: string): Promise<TDepartment> {
    const departmentDelete = await this.prisma.department.delete({
      where: {
        id,
      },
    });

    return departmentDelete;
  }
}
