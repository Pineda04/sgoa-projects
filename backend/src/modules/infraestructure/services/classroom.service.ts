import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClassroomDto } from '../dto/create-classroom.dto';
import { UpdateClassroomDto } from '../dto/update-classroom.dto';
import {
  TClassroom,
  TClassroomWithDepartments,
  ClassroomScheduleDto,
  DaySchedule,
  DayOfWeek,
} from '../types';
import { QueryPaginationDto } from 'src/common/dto';
import { QueryClassroomDto } from '../dto';
import { isUUID } from 'class-validator';
import { IPaginateOutput } from 'src/common/interfaces';
import {
  COURSE_CLASSROOM_DAY_CODES,
  CourseClassroomDayCode,
  courseClassroomSectionsOverlap,
  normalizeText,
  parseCourseClassroomDays,
  parseCourseClassroomSection,
  paginate,
  paginateOutput,
} from 'src/common/utils';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class ClassroomService {
  constructor(private prisma: PrismaService) {}

  async create(createClassroomDto: CreateClassroomDto) {
    const { departmentIds, ...classroomData } = createClassroomDto;

    const newClassroom = await this.prisma.classroom.create({
      data: {
        ...classroomData,
        classroomDepartments: departmentIds?.length
          ? { create: departmentIds.map((departmentId) => ({ departmentId })) }
          : undefined,
      },
    });

    return newClassroom;
  }

  async findAll(): Promise<TClassroom[]> {
    const classrooms = await this.prisma.classroom.findMany();

    return classrooms;
  }

  async findAllWithPagination(
    query: QueryClassroomDto,
  ): Promise<IPaginateOutput<TClassroom>> {
    const where: Prisma.ClassroomWhereInput = {};

    if (query.name) {
      where.name = { contains: query.name, mode: 'insensitive' };
    }
    if (query.buildingId) {
      where.buildingId = query.buildingId;
    }
    if (query.roomTypeId) {
      where.roomTypeId = query.roomTypeId;
    }
    if (query.activeStatus !== undefined) {
      where.activeStatus = query.activeStatus === 'true';
    }

    const [classrooms, count] = await Promise.all([
      this.prisma.classroom.findMany({
        where,
        include: {
          classroomDepartments: {
            include: {
              department: { select: { id: true, name: true } },
            },
          },
        },
        ...paginate(query),
      }),
      this.prisma.classroom.count({ where }),
    ]);

    const mapped = classrooms.map(({ classroomDepartments, ...rest }) => ({
      ...rest,
      departments: classroomDepartments.map((cd) => cd.department),
    }));

    return paginateOutput<TClassroom>(mapped, count, query);
  }

  async findOne(id: string): Promise<TClassroomWithDepartments> {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id },
      include: {
        classroomDepartments: {
          include: {
            department: {
              select: { id: true, name: true, uvs: true, facultyId: true },
            },
          },
        },
      },
    });

    if (!classroom) {
      throw new NotFoundException(`El aula con id <${id}> no fue encontrado.`);
    }

    const { classroomDepartments, ...rest } = classroom;

    return {
      ...rest,
      departments: classroomDepartments.map((cd) => cd.department),
    };
  }

  async findBySearchTerm(searchTerm: string = '', query: QueryPaginationDto) {
    const where: Prisma.ClassroomWhereInput = {
      OR: [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        {
          classroomInfoView: {
            normalizedName: {
              contains: normalizeText(searchTerm),
              mode: 'insensitive',
            },
          },
        },
        {
          roomType: {
            description: { contains: searchTerm, mode: 'insensitive' },
          },
        },
        {
          building: {
            name: { contains: searchTerm, mode: 'insensitive' },
          },
        },
      ],
    };

    const [results, count] = await Promise.all([
      this.prisma.classroom.findMany({
        where,
        ...paginate(query),
        select: {
          id: true,
          name: true,
          building: {
            select: {
              id: true,
              name: true,
            },
          },
          classroomDepartments: {
            select: {
              department: {
                select: { id: true, name: true },
              },
            },
          },
        },
      }),
      this.prisma.classroom.count({
        where,
      }),
    ]);

    const mapped = results.map(({ classroomDepartments, ...rest }) => ({
      ...rest,
      departments: classroomDepartments.map((cd) => cd.department),
    }));

    return paginateOutput(mapped, count, query);
  }

  //Por como esta hecho, para no tocar la relacion con departamentos, deben no enviar ese campo, enviarlo vacío implica vaciarlo,
  //además, se deben enviar todas las relaciones que tiene cada que se edita, no solo las nuevas o modificadas, porque las rehace todas.
  async update(id: string, updateClassroomDto: UpdateClassroomDto) {
    const { departmentIds, ...classroomData } = updateClassroomDto;

    const classroomUpdate = await this.prisma.classroom.update({
      where: { id },
      data: {
        ...classroomData,
        classroomDepartments: departmentIds
          ? {
              deleteMany: {},
              create: departmentIds.map((departmentId) => ({ departmentId })),
            }
          : undefined,
      },
    });

    return classroomUpdate;
  }

  async remove(id: string): Promise<TClassroom> {
    const classroomDelete = await this.prisma.classroom.delete({
      where: {
        id,
      },
    });

    return classroomDelete;
  }

  async getAvailability(
    id: string,
    periodId: string,
    dayOfWeek?: string,
  ): Promise<ClassroomScheduleDto> {
    if (!periodId || !isUUID(periodId)) {
      throw new BadRequestException(
        'periodId es obligatorio y debe ser válido',
      );
    }

    if (
      dayOfWeek &&
      !COURSE_CLASSROOM_DAY_CODES.includes(dayOfWeek as CourseClassroomDayCode)
    ) {
      throw new BadRequestException(
        'El parámetro dayOfWeek debe ser uno de: Lu, Ma, Mi, Ju, Vi, Sa o Do.',
      );
    }

    const classroom = await this.prisma.classroom.findUnique({
      where: { id },
    });

    if (!classroom) {
      throw new NotFoundException(`El aula con id <${id}> no fue encontrado.`);
    }

    // buscar courseClassroom en base a per id de aula e id de periodo, e incluir assigmentReport y curso.
    const courseClassrooms = await this.prisma.courseClassroom.findMany({
      where: {
        classroomId: id,
        teachingSession: {
          assignmentReport: {
            periodId,
          },
        },
      },
      include: {
        course: {
          select: { name: true },
        },
        teachingSession: {
          include: {
            assignmentReport: {
              include: {
                teacher: {
                  include: {
                    user: {
                      select: { name: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    //Estructura para el dto final:
    const schedule: Record<CourseClassroomDayCode, DaySchedule> = {
      Lu: { occupied: [], available: [] },
      Ma: { occupied: [], available: [] },
      Mi: { occupied: [], available: [] },
      Ju: { occupied: [], available: [] },
      Vi: { occupied: [], available: [] },
      Sa: { occupied: [], available: [] },
      Do: { occupied: [], available: [] },
    };

    for (const cc of courseClassrooms) {
      const days = parseCourseClassroomDays(cc.days);
      const section = parseCourseClassroomSection(cc.section);

      if (!days) {
        throw new BadRequestException(
          `No se puede calcular la disponibilidad: la clase <${cc.course.name}> tiene días no válidos.`,
        );
      }

      const appliesToRequestedDay =
        !dayOfWeek || days.includes(dayOfWeek as CourseClassroomDayCode);

      if (!section && appliesToRequestedDay) {
        throw new BadRequestException(
          `No se puede calcular la disponibilidad: la clase <${cc.course.name}> tiene un horario legado sin rango explícito.`,
        );
      }

      if (!section) continue;

      for (const day of days) {
        schedule[day].occupied.push({
          startTime: section.startTime,
          endTime: section.endTime,
          courseId: cc.courseId,
          courseName: cc.course.name,
          teacherId: cc.teachingSession.assignmentReport.teacherId,
          teacherName: cc.teachingSession.assignmentReport.teacher.user.name,
        });
      }
    }

    //Listado de horas posibles, para obtener horas disponibles
    const slots = [
      { startTime: '07:00', endTime: '08:00' },
      { startTime: '08:00', endTime: '09:00' },
      { startTime: '09:00', endTime: '10:00' },
      { startTime: '10:00', endTime: '11:00' },
      { startTime: '11:00', endTime: '12:00' },
      { startTime: '12:00', endTime: '13:00' },
      { startTime: '13:00', endTime: '14:00' },
      { startTime: '14:00', endTime: '15:00' },
      { startTime: '15:00', endTime: '16:00' },
      { startTime: '16:00', endTime: '17:00' },
      { startTime: '17:00', endTime: '18:00' },
      { startTime: '18:00', endTime: '19:00' },
      { startTime: '19:00', endTime: '20:00' },
      { startTime: '20:00', endTime: '21:00' },
    ];

    //Por cada dia en schedule
    for (const day of COURSE_CLASSROOM_DAY_CODES) {
      const occupied = schedule[day].occupied; // Se extrae en una variable el listado de horas ocupadas ese dia

      //Listado para horas disponibles
      const available: DaySchedule['available'] = [];

      // Por cada hora en slot
      for (const slot of slots) {
        const conflict = occupied.find((o) =>
          courseClassroomSectionsOverlap(
            `${o.startTime} - ${o.endTime}`,
            `${slot.startTime} - ${slot.endTime}`,
          ),
        );

        //Si no es true el booleano, la hora esta desocupada y se guarda
        if (!conflict) {
          available.push(slot);
        }
      }

      //Dentro de ese dia, se guarda el objeto de horas disponibles...
      schedule[day].available = available;
    }

    const dayNames: Record<CourseClassroomDayCode, DayOfWeek> = {
      Lu: 'MONDAY',
      Ma: 'TUESDAY',
      Mi: 'WEDNESDAY',
      Ju: 'THURSDAY',
      Vi: 'FRIDAY',
      Sa: 'SATURDAY',
      Do: 'SUNDAY',
    };
    const outputSchedule: ClassroomScheduleDto['schedule'] = {};

    for (const day of COURSE_CLASSROOM_DAY_CODES) {
      if (!dayOfWeek || day === dayOfWeek) {
        outputSchedule[dayNames[day]] = schedule[day];
      }
    }

    //Se retorna y mapea para que encaje co el type esperado
    return {
      classroomId: id, //Porque tengo que retornar el id que el mismo usuario me dió? xd
      periodId,
      schedule: outputSchedule,
    };
  }
}
