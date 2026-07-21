import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { parseISO, startOfDay } from 'date-fns';
import { PrismaService } from 'src/prisma/prisma.service';
import { IPaginateOutput } from 'src/common/interfaces';
import { paginate, paginateOutput } from 'src/common/utils';
import { CheckFiltersDto, CreateCheckDto } from '../dto';
import {
  TScheduleComplianceCheck,
  TScheduleComplianceCheckDetail,
} from '../types';
import { buildCheckWhere } from '../utils/build-check-where.util';

@Injectable()
export class MonitorChecksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    monitorId: string,
    createCheckDto: CreateCheckDto,
  ): Promise<TScheduleComplianceCheck> {
    const courseClassroom = await this.prisma.courseClassroom.findUnique({
      where: { id: createCheckDto.courseClassroomId },
    });

    if (!courseClassroom)
      throw new NotFoundException(
        `La sección de asignatura con id <${createCheckDto.courseClassroomId}> no fue encontrada.`,
      );

    const checkDate = startOfDay(parseISO(createCheckDto.checkDate));

    const existingCheck = await this.prisma.scheduleComplianceCheck.findUnique({
      where: {
        courseClassroomId_checkDate_checkTime: {
          courseClassroomId: createCheckDto.courseClassroomId,
          checkDate,
          checkTime: createCheckDto.checkTime,
        },
      },
    });

    if (existingCheck)
      throw new BadRequestException(
        'Ya existe una verificación registrada para esta sección de asignatura en la fecha y hora indicadas.',
      );

    const newCheck = await this.prisma.scheduleComplianceCheck.create({
      data: {
        courseClassroomId: createCheckDto.courseClassroomId,
        monitorId,
        checkDate,
        checkTime: createCheckDto.checkTime,
        isPresent: createCheckDto.isPresent,
        observation: createCheckDto.observation,
        offlineId: createCheckDto.offlineId,
      },
    });

    return newCheck;
  }

  async findAllWithFilters(
    query: CheckFiltersDto,
  ): Promise<IPaginateOutput<TScheduleComplianceCheckDetail>> {
    const where = buildCheckWhere(query);

    const [checks, count] = await Promise.all([
      this.prisma.scheduleComplianceCheck.findMany({
        where,
        ...paginate(query),
        orderBy: [{ checkDate: 'desc' }, { checkTime: 'desc' }],
        include: {
          monitor: { select: { id: true, name: true } },
          courseClassroom: {
            select: {
              id: true,
              section: true,
              days: true,
              course: { select: { name: true, code: true } },
              classroom: {
                select: {
                  name: true,
                  building: { select: { id: true, name: true } },
                },
              },
              teachingSession: {
                select: {
                  assignmentReport: {
                    select: {
                      teacher: {
                        select: { id: true, user: { select: { name: true } } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.scheduleComplianceCheck.count({ where }),
    ]);

    const mapped: TScheduleComplianceCheckDetail[] = checks.map(
      ({ courseClassroom, monitor, ...check }) => ({
        ...check,
        monitor,
        courseClassroom: {
          id: courseClassroom.id,
          section: courseClassroom.section,
          days: courseClassroom.days,
          course: courseClassroom.course,
          classroom: courseClassroom.classroom,
          teacher: {
            id: courseClassroom.teachingSession.assignmentReport.teacher.id,
            name: courseClassroom.teachingSession.assignmentReport.teacher.user
              .name,
          },
        },
      }),
    );

    return paginateOutput<TScheduleComplianceCheckDetail>(mapped, count, query);
  }
}
