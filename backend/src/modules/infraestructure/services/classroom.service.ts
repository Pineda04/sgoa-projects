import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClassroomDto } from '../dto/create-classroom.dto';
import { UpdateClassroomDto } from '../dto/update-classroom.dto';
import { TClassroom, TCreateClassroom, TUpdateClassroom, TClassroomWithDepartments, ClassroomScheduleDto, TDigitalBlackboardType } from '../types';
import { QueryPaginationDto } from 'src/common/dto';
import { isUUID } from 'class-validator';
import { IPaginateOutput } from 'src/common/interfaces';
import { normalizeText, paginate, paginateOutput } from 'src/common/utils';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class ClassroomService {
  constructor(private prisma: PrismaService) {}

  async create(
    createClassroomDto: CreateClassroomDto,
  ): Promise<TCreateClassroom> {
    const newClassroom = await this.prisma.classroom.create({
      data: {
        ...createClassroomDto,
      },
    });

    return newClassroom;
  }

  async findAll(): Promise<TClassroom[]> {
    const classrooms = await this.prisma.classroom.findMany();

    return classrooms;
  }

  async findAllWithPagination(
    query: QueryPaginationDto,
  ): Promise<IPaginateOutput<TClassroom>> {
    const [classrooms, count] = await Promise.all([
      this.prisma.classroom.findMany({
        ...paginate(query),
      }),
      this.prisma.classroom.count(),
    ]);

    return paginateOutput<TClassroom>(classrooms, count, query);
  }

  async findOneDigitalBlackboard(id: string): Promise<TDigitalBlackboardType> {
    const digitalBlackboard = await this.prisma.digitalBlackboard.findUnique({
      where: {
        id,
      },
    });

    if (!digitalBlackboard)
      throw new NotFoundException(
        `La pizarra digital con id <${id}> no fue encontrada.`,
      );

    return digitalBlackboard;
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
        },
      }),
      this.prisma.classroom.count({
        where,
      }),
    ]);

    return paginateOutput(results, count, query);
  }

  async update(
    id: string,
    updateClassroomDto: UpdateClassroomDto,
  ): Promise<TUpdateClassroom> {
    const classroomUpdate = await this.prisma.classroom.update({
      where: {
        id,
      },
      data: {
        ...updateClassroomDto,
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
      dayOfWeek?: string) : Promise<ClassroomScheduleDto>
  {
      if (!periodId || !isUUID(periodId)) {
        throw new BadRequestException('periodId es obligatorio y debe ser válido');
      }

      const validDays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

      if (dayOfWeek && !validDays.includes(dayOfWeek)) {
        throw new BadRequestException(
          'El parámetro dayOfWeek debe ser uno de: Lu, Ma, Mi, Ju, Vi, Sa o Do.',
        );
      }

      const classroom = await this.prisma.classroom.findUnique({
       where: { id },
      });

      if (!classroom) {
        throw new NotFoundException(`El aula con id <${id}> no fue encontrado.`,);
      }

      // buscar courseClassroom en base a per id de aula e id de periodo, e incluir assigmentReport y curso.
      const courseClassrooms =
        await this.prisma.courseClassroom.findMany({
          where: {
            classroomId: id,
            teachingSession: {
              assignmentReport: {
                periodId,
              },
            },
          },
          include: {
           course: true,
            teachingSession: {
             include: {
                assignmentReport: true,
              },
            },
          },
        });
      
      //Estructura para el dto final: 
      const schedule: Record<string, any> = {
        Lu: { occupied: [], available: [] },
        Ma: { occupied: [], available: [] },
        Mi: { occupied: [], available: [] },
        Ju: { occupied: [], available: [] },
        Vi: { occupied: [], available: [] },
        Sa: { occupied: [], available: [] },
        Do: { occupied: [], available: [] },
      };

      //Por cada courseClassroom, separar la propiedad days en secciones de 2, para tener listado de abreviaturas...
      for (const cc of courseClassrooms) {
        const days = cc.days.match(/.{2}/g) || [];

        //Obtener horas de courseClassroom
        const [startTime, endTime] = cc.section.split(' - ');

        //Por cada dia en days
        for (const day of days) {
          //Se crea el objeto dentro del dia correspondiente acorde a la abreviatura de dia
          schedule[day].occupied.push({ 
            startTime,
            endTime,
            courseId: cc.courseId,
            teacherId: cc.teachingSession.assignmentReport.teacherId,
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
      for (const day of Object.keys(schedule)) {
        const occupied = schedule[day].occupied; // Se extrae en una variable el listado de horas ocupadas ese dia

        //Listado para horas disponibles
        const available : object[] = [];

        // Por cada hora en slot
        for (const slot of slots) {

          //Booleano sera true si esa hora de slot es igual a al menos una de las horas ocupadas
          const conflict = occupied.find( (o) =>
              o.startTime === slot.startTime &&
              o.endTime === slot.endTime,
          );

          //Si no es true el booleano, la hora esta desocupada y se guarda
          if (!conflict) {
            available.push(slot);
          }
        }
        
        //Dentro de ese dia, se guarda el objeto de horas disponibles...
        schedule[day].available = available;
      }

      //Si se da el filtro de dia específico, finalSchedule solo incluira ese dia.
      const finalSchedule = dayOfWeek ? { [dayOfWeek]: schedule[dayOfWeek] } : schedule;

      //Se retorna y mapea para que encaje co el type esperado
      return {
        classroomId: id, //Porque tengo que retornar el id que el mismo usuario me dió? xd
        periodId,
        schedule: {
          MONDAY: finalSchedule.Lu,
          TUESDAY: finalSchedule.Ma,
          WEDNESDAY: finalSchedule.Mi,
          THURSDAY: finalSchedule.Ju,
          FRIDAY: finalSchedule.Vi,
          SATURDAY: finalSchedule.Sa,
          SUNDAY: finalSchedule.Do,
        },
      };
  }   
}


