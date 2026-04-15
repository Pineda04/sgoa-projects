import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTeacherDepartmentPositionDto } from '../dto/create-teacher-department-position.dto';
import { UpdateTeacherDepartmentPositionDto } from '../dto/update-teacher-department-position.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  TCoordination,
  TOutputTeacherDeptPos,
  TTeacherDeptPos,
  TTeacherInclude,
} from '../types';
import { TeachersService } from 'src/modules/teachers/services/teachers.service';
import { getTime, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { QueryPaginationDto } from 'src/common/dto';
import { IPaginateOutput } from 'src/common/interfaces';
import { formatDateTimeZone, paginate, paginateOutput } from 'src/common/utils';
import { EPosition } from 'src/modules/teachers-config/enums';
import { PositionsService } from 'src/modules/teachers-config/services/positions.service';
import { DepartmentsService } from 'src/modules/centers/services/departments.service';

@Injectable()
export class TeacherDepartmentPositionService {
  private readonly selectOptionsTDP = {
    // Se puede usar include tambien...
    id: true,
    centerDepartmentId: true,
    startDate: true,
    endDate: true,
    teacher: {
      select: {
        id: true,
        user: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    },
    position: {
      select: {
        id: true,
        name: true,
      },
    },
    centerDepartment: {
      select: {
        id: true,
        centerId: true,
        departmentId: true,
        center: {
          select: {
            name: true,
          },
        },
        department: {
          select: {
            name: true,
          },
        },
      },
    },
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly teachersService: TeachersService,
    private readonly positionsService: PositionsService,
    private readonly departmentsService: DepartmentsService,
  ) {}

  async create(
    createTeacherDepartmentPositionDto: CreateTeacherDepartmentPositionDto,
  ): Promise<TTeacherDeptPos> {
    const { userId, centerDepartmentId, positionId, startDate } =
      createTeacherDepartmentPositionDto;

    const teacher = await this.teachersService.findOneByUserId(userId);

    // const centerDepartment =
    //   await this.centerDepartmentsService.findByCenterAndDepartmentOrFail(
    //     centerId,
    //     departmentId,
    //   );

    return await this.createFn(
      teacher.id,
      centerDepartmentId,
      positionId,
      startDate,
    );
  }

  // Para usos internos
  async createWithTeacherId(
    teacherId: string,
    createTeacherDepartmentPositionDto: CreateTeacherDepartmentPositionDto,
  ): Promise<TTeacherDeptPos> {
    const { centerDepartmentId, positionId, startDate } =
      createTeacherDepartmentPositionDto;

    // const centerDepartment =
    //   await this.centerDepartmentsService.findByCenterAndDepartmentOrFail(
    //     centerId,
    //     departmentId,
    //   );

    return await this.createFn(
      teacherId,
      centerDepartmentId,
      positionId,
      startDate,
    );
  }

  private async createFn(
    teacherId: string,
    centerDepartmentId: string,
    positionId: string,
    startDate: string,
  ) {
    const coordinatorPosition = await this.positionsService.findOneByName(
      EPosition.DEPARTMENT_HEAD,
    );

    if (positionId === coordinatorPosition.id) {
      const existingCoordinator =
        await this.prisma.teacherDepartmentPosition.findFirst({
          where: {
            positionId,
            centerDepartmentId,
            endDate: null, // activo
          },
          select: { id: true, centerDepartmentId: true },
        });

      if (existingCoordinator)
        throw new BadRequestException(
          'El departamento ya cuenta con un usuario activo con cargo de Jefe/Coordinador. Debe finalizarlo antes de asignar uno nuevo.',
        );
    }

    // Validación por centerDepartmentId (para evitar duplicados exactos)
    const teacherDeptPosExists =
      await this.prisma.teacherDepartmentPosition.findFirst({
        where: { teacherId, centerDepartmentId },
        select: { endDate: true },
      });

    if (teacherDeptPosExists && teacherDeptPosExists.endDate === null)
      throw new BadRequestException(
        'El docente ya cuenta con un cargo académico en este centro-departamento y se encuentra activo.',
      );

    const newTeacherDeptPos =
      await this.prisma.teacherDepartmentPosition.create({
        data: {
          teacherId,
          centerDepartmentId,
          positionId,
          startDate: parseISO(startDate),
        },
      });

    return newTeacherDeptPos;
  }

  async findAll(): Promise<TOutputTeacherDeptPos[]> {
    const teacherDeptPos = await this.prisma.teacherDepartmentPosition.findMany(
      {
        // Se puede usar include tambien...
        select: this.selectOptionsTDP,
      },
    );

    // if (teacherDeptPoss.length === 0)
    //   throw new NotFoundException('No se encontraron datos.'); // tambien se puede devolver un 200 como consulta exitosa pero con data []

    const mappedTeacherDeptPos: TOutputTeacherDeptPos[] =
      this.mappedTeacherDeptPos(teacherDeptPos);

    return mappedTeacherDeptPos;
  }

  async findAllWithPagination(
    query: QueryPaginationDto,
  ): Promise<IPaginateOutput<TOutputTeacherDeptPos>> {
    const [teacherDeptPos, count] = await Promise.all([
      this.prisma.teacherDepartmentPosition.findMany({
        ...paginate(query),
        select: this.selectOptionsTDP,
      }),
      this.prisma.teacherDepartmentPosition.count(),
    ]);

    // if (teacherDeptPoss.length === 0)
    //   throw new NotFoundException('No se encontraron datos.'); // tambien se puede devolver un 200 como consulta exitosa pero con data []

    const mappedTeacherDeptPos: TOutputTeacherDeptPos[] =
      this.mappedTeacherDeptPos(teacherDeptPos);

    return paginateOutput<TOutputTeacherDeptPos>(
      mappedTeacherDeptPos,
      count,
      query,
    );
  }

  async findAllByCenterDepartmentId(
    query: QueryPaginationDto,
    centerDepartmentId: string,
    omitTeacherId?: string, // Opcional para omitir un docente específico, en este caso el que esta haciendo la consulta
  ): Promise<IPaginateOutput<TOutputTeacherDeptPos>> {
    await this.departmentsService.findOne(centerDepartmentId);

    const where = {
      centerDepartmentId,
    };
    const whereOmitId = {
      ...where,
      teacherId: {
        not: omitTeacherId,
      },
    };

    const [teacherDeptPos, count] = await Promise.all([
      this.prisma.teacherDepartmentPosition.findMany({
        where: omitTeacherId ? whereOmitId : where,
        ...paginate(query),
        select: this.selectOptionsTDP,
      }),
      this.prisma.teacherDepartmentPosition.count({
        where: omitTeacherId ? whereOmitId : where,
      }),
    ]);

    // if (teacherDeptPoss.length === 0)
    //   throw new NotFoundException('No se encontraron datos.'); // tambien se puede devolver un 200 como consulta exitosa pero con data []

    if (count === 0)
      throw new NotFoundException(
        `No se encontraron datos para el departamento con id <${centerDepartmentId}>.`,
      );

    const mappedTeacherDeptPos: TOutputTeacherDeptPos[] = teacherDeptPos.map(
      (tdp) => ({
        id: tdp.id,
        userId: tdp.teacher.user.id,
        teacherId: tdp.teacher.id,
        code: tdp.teacher.user.code,
        name: tdp.teacher.user.name,
        centerDepartment: tdp.centerDepartment,
        positionId: tdp.position.id,
        positionName: tdp.position.name,
        startDate: formatInTimeZone(
          tdp.startDate,
          'America/Tegucigalpa',
          'yyyy-MM-dd HH:mm:ss',
        ),
        endDate: tdp.endDate
          ? formatInTimeZone(
              tdp.endDate,
              'America/Tegucigalpa',
              'yyyy-MM-dd HH:mm:ss',
            )
          : null,
      }),
    );

    return paginateOutput<TOutputTeacherDeptPos>(
      mappedTeacherDeptPos,
      count,
      query,
    );
  }

  async findAllByCoordinator(
    query: QueryPaginationDto,
    userId: string,
    centerDepartmentId: string,
  ) {
    const user = await this.findOneDepartmentHeadByUserIdAndCenterDepartment(
      userId,
      centerDepartmentId,
    );

    if (!user.centerDepartment)
      throw new NotFoundException(
        `El usuario con id <${userId}> no tiene un departamento asignado.`,
      );

    if (!user.teacher)
      throw new NotFoundException(
        `El usuario con id <${userId}> no tiene un docente asociado.`,
      );

    return await this.findAllByCenterDepartmentId(
      query,
      user.centerDepartment.id,
      user.teacher.id,
    );
  }

  async findOne(id: string): Promise<TTeacherDeptPos> {
    const teacherDeptPos =
      await this.prisma.teacherDepartmentPosition.findUnique({
        where: {
          id,
        },
        select: this.selectOptionsTDP,
      });

    if (!teacherDeptPos)
      throw new NotFoundException(
        `El <docente-departamente-cargo> con id <${id}> no fue encontrado.`,
      );

    return teacherDeptPos;
  }

  async findAllByCenterDepartmentIdsWithPagination(
    query: QueryPaginationDto,
    centerDepartmentIds: string[],
    omitTeacherId?: string,
  ): Promise<IPaginateOutput<TOutputTeacherDeptPos>> {
    const whereBase = { centerDepartmentId: { in: centerDepartmentIds } };
    const where = omitTeacherId
      ? { ...whereBase, teacherId: { not: omitTeacherId } }
      : whereBase;

    const [items, count] = await Promise.all([
      this.prisma.teacherDepartmentPosition.findMany({
        where,
        ...paginate(query),
        select: this.selectOptionsTDP,
      }),
      this.prisma.teacherDepartmentPosition.count({ where }),
    ]);

    if (count === 0)
      throw new NotFoundException(
        'No se encontraron docentes para los centerDepartment indicados.',
      );

    const mapped: TOutputTeacherDeptPos[] = this.mappedTeacherDeptPos(items);

    return paginateOutput(mapped, count, query);
  }

  async findDepartmentHeadPositionsByUserId(
    id: string,
  ): Promise<TCoordination[]> {
    const coordinatorPosition = await this.positionsService.findOneByName(
      EPosition.DEPARTMENT_HEAD,
    );

    const teacherDeptPos = await this.prisma.teacherDepartmentPosition.findMany(
      {
        where: {
          teacher: { userId: id },
          positionId: coordinatorPosition.id,
          endDate: null,
        },
        relationLoadStrategy: 'join',
        select: {
          id: true,
          centerDepartmentId: true,
          startDate: true,
          position: {
            select: {
              id: true,
              name: true,
            },
          },
          centerDepartment: {
            select: {
              id: true,
              center: {
                select: {
                  id: true,
                  name: true,
                },
              },
              department: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    );

    if (teacherDeptPos.length === 0)
      throw new NotFoundException(
        `No se encontró al docente con userId <${id}> como jefe de departamento activo.`,
      );

    return teacherDeptPos.map((tdp) => ({
      centerDepartmentId: tdp.centerDepartmentId,
      center: tdp.centerDepartment.center,
      department: tdp.centerDepartment.department,
      position: tdp.position,
    }));
  }

  async findOneDepartmentHeadByUserIdAndCenterDepartment(
    userId: string,
    centerDepartmentId: string,
  ): Promise<TTeacherInclude> {
    const coordinatorPosition = await this.positionsService.findOneByName(
      EPosition.DEPARTMENT_HEAD,
    );

    const teacherDeptPos =
      await this.prisma.teacherDepartmentPosition.findFirst({
        where: {
          AND: [
            { teacher: { userId } },
            { centerDepartmentId },
            { positionId: coordinatorPosition.id },
            { endDate: null }, // activo
          ],
        },
        select: this.selectOptionsTDP,
        relationLoadStrategy: 'join',
      });

    if (!teacherDeptPos) {
      throw new NotFoundException(
        `El usuario con id <${userId}> no es coordinador activo del centro-departamento <${centerDepartmentId}>.`,
      );
    }

    return teacherDeptPos;
  }

  async findOneByTeacherCodeAndCenterDepartmentId(
    teacherCode: string,
    centerDepartmentId: string,
  ): Promise<TTeacherDeptPos | null> {
    const teacher = await this.teachersService.findOneByCode(teacherCode);

    const teacherDeptPosExists =
      await this.prisma.teacherDepartmentPosition.findFirst({
        where: {
          teacherId: teacher.id,
          centerDepartmentId,
        },
        select: {
          id: true,
          teacherId: true,
          centerDepartmentId: true,
          startDate: true,
          endDate: true,
        },
      });

    return teacherDeptPosExists;
  }

  async findOneByTeacherIdAndCenterDepartmentId(
    teacherId: string,
    centerDepartmentId: string,
  ): Promise<TTeacherDeptPos | null> {
    const teacherDeptPosExists =
      await this.prisma.teacherDepartmentPosition.findFirst({
        where: {
          teacherId,
          centerDepartmentId,
        },
        select: {
          id: true,
          teacherId: true,
          centerDepartmentId: true,
          startDate: true,
          endDate: true,
        },
      });

    return teacherDeptPosExists;
  }

  async findPositionsByUserAndCenterDepartment(
    userId: string,
    centerDepartmentId: string,
  ) {
    const position = await this.prisma.teacherDepartmentPosition.findFirst({
      where: {
        teacher: {
          userId,
        },
        centerDepartmentId,
      },
      relationLoadStrategy: 'join',
      include: {
        teacher: { select: { user: { select: { name: true } } } },
        position: {
          select: {
            name: true,
          },
        },
        centerDepartment: {
          include: {
            center: {
              select: {
                name: true,
              },
            },
            department: {
              select: {
                name: true,
                faculty: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!position)
      throw new BadRequestException(
        `No se encontro un cargo académico para el usuario <${userId}> en la relación centro-departamento <${centerDepartmentId}>.`,
      );

    return {
      teacherName: position.teacher.user.name,
      position: position.position.name,
      department: position.centerDepartment.department.name,
      faculty: position.centerDepartment.department.faculty.name,
      center: position.centerDepartment.center.name,
    };
  }

  async update(
    id: string,
    updateTeacherDepartmentPositionDto: UpdateTeacherDepartmentPositionDto,
  ): Promise<TTeacherDeptPos> {
    const teacherDeptPos = await this.findOne(id);
    const { endDate } = updateTeacherDepartmentPositionDto;

    if (endDate) {
      updateTeacherDepartmentPositionDto.endDate =
        parseISO(endDate).toISOString();

      if (getTime(endDate) < getTime(teacherDeptPos.startDate))
        throw new BadRequestException(
          `La fecha de finalización ingresada <${endDate}> no debe ser menor a la fecha de inicio <${formatInTimeZone(teacherDeptPos.startDate, 'America/Tegucigalpa', 'yyyy-MM-dd HH:mm:ss')}>, por favor agregue una fecha válida.`,
        );
    }

    const teacherDeptPosUpdate =
      await this.prisma.teacherDepartmentPosition.update({
        where: {
          id,
        },
        data: {
          ...updateTeacherDepartmentPositionDto,
        },
      });

    return teacherDeptPosUpdate;
  }

  async remove(id: string): Promise<TTeacherDeptPos> {
    const teacherDeptPosDelete =
      await this.prisma.teacherDepartmentPosition.delete({
        where: {
          id,
        },
      });

    return teacherDeptPosDelete;
  }

  private mappedTeacherDeptPos(
    teacherDeptPos: TTeacherInclude[],
  ): TOutputTeacherDeptPos[] {
    return teacherDeptPos.map((tdp) => ({
      id: tdp.id,
      userId: tdp.teacher.user.id,
      teacherId: tdp.teacher.id,
      code: tdp.teacher.user.code,
      name: tdp.teacher.user.name,
      // departmentId: tdp.centerDepartment.departmentId,
      // departmentName: tdp.centerDepartment.department.name,
      centerDepartment: tdp.centerDepartment,
      positionId: tdp.position.id,
      positionName: tdp.position.name,
      startDate: formatDateTimeZone(tdp.startDate).toString(),
      endDate: tdp.endDate ? formatDateTimeZone(tdp.endDate).toString() : null,
    }));
  }
}
