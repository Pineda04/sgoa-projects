import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateDepartmentDto } from '../dto/update-department.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  TCenter,
  TCenterDepartment,
  TCenterDepartmentJoin,
  TDepartment,
} from '../types';
import { TUser } from 'src/modules/users/types';
import { TCustomPick } from 'src/common/types';
import { EPosition } from 'src/modules/teachers-config/enums';
import { TPosition } from 'src/modules/teachers-config/types';
import { CreateCenterDepartmentDto } from '../dto/create-center-department.dto';

@Injectable()
export class CenterDepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createDepartmentDto: CreateCenterDepartmentDto,
  ): Promise<TCenterDepartment> {
    const newCenterDepartment = await this.prisma.centerDepartment.create({
      data: {
        ...createDepartmentDto,
      },
    });

    return newCenterDepartment;
  }

  async findAllWithSelect(): Promise<TCenterDepartmentJoin[]> {
    const centerDepartments = await this.prisma.centerDepartment.findMany({
      relationLoadStrategy: 'join',
      include: {
        center: true,
        department: true,
      },
    });

    // if (departments.length === 0)
    //   throw new NotFoundException('No se encontraron datos.'); // tambien se puede devolver un 200 como consulta exitosa pero con data []

    return centerDepartments;
  }

  async findAll(): Promise<TCenterDepartment[]> {
    const centerDepartments = await this.prisma.centerDepartment.findMany();

    // if (departments.length === 0)
    //   throw new NotFoundException('No se encontraron datos.'); // tambien se puede devolver un 200 como consulta exitosa pero con data []

    return centerDepartments;
  }

  async findAllWithCoordinators(): Promise<TDepartment[]> {
    const departments = await this.prisma.centerDepartment.findMany({
      where: {
        teacherAppointments: {
          some: {
            position: {
              // name: EPosition.DEPARTMENT_HEAD,
              name: {
                contains: EPosition.DEPARTMENT_HEAD,
              },
            },
          },
        },
      },
      relationLoadStrategy: 'join',
      include: {
        center: true,
        department: true,
        teacherAppointments: {
          where: {
            position: {
              name: EPosition.DEPARTMENT_HEAD,
            },
          },
          select: {
            position: true,
            teacher: {
              select: {
                id: true,
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
    });

    // if (departments.length === 0)
    //   throw new NotFoundException('No se encontraron datos.'); // tambien se puede devolver un 200 como consulta exitosa pero con data []

    const mapped: Array<
      TDepartment & {
        center: TCenter;
        coordinator: {
          id: string;
          code: string;
          name: string;
          teacherId: string;
        };
      }
    > = (
      departments as (TCenterDepartmentJoin & {
        teacherAppointments: {
          position: TPosition;
          teacher: {
            id: string;
            user: TCustomPick<TUser, 'id' | 'code' | 'name'>;
          };
        }[];
      })[]
    ).map((dep) => {
      const { teacherAppointments, ...depToMap } = dep;
      const tc = teacherAppointments[0];

      return {
        ...depToMap.department,
        center: depToMap.center,
        coordinator: {
          id: tc.teacher.id,
          teacherId: tc.teacher.id,
          name: tc.teacher.user.name,
          code: tc.teacher.user.code,
        },
      };
    });

    return mapped;
  }

  async findOne(id: string): Promise<TCenterDepartment> {
    const department = await this.prisma.centerDepartment.findUnique({
      where: {
        id,
      },
    });

    if (!department)
      throw new NotFoundException(
        `El centro-departamento con id <${id}> no fue encontrado.`,
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

  async findByCenterAndDepartmentOrFail(
    centerId: string,
    departmentId: string,
  ): Promise<TCenterDepartment> {
    const centerDepartment = await this.prisma.centerDepartment.findUnique({
      where: {
        centerId_departmentId: {
          centerId,
          departmentId,
        },
      },
    });

    if (!centerDepartment) {
      throw new BadRequestException(
        `No existe relación entre el centro <${centerId}> y el departamento <${departmentId}>.`,
      );
    }

    return centerDepartment;
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
