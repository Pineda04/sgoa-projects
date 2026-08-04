import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IPaginateOutput } from 'src/common/interfaces';
import {
  paginate,
  paginateOutput,
  parseCourseClassroomDays,
  parseCourseClassroomSection,
} from 'src/common/utils';
import { CheckFiltersDto, CreateCheckDto } from '../dto';
import {
  TScheduleComplianceCheck,
  TScheduleComplianceCheckDetail,
} from '../types';
import { buildCheckWhere } from '../utils/build-check-where.util';
import { MonitorAccessService } from './monitor-access.service';
import {
  INSTITUTIONAL_TIME_ZONE,
  monitoringDayStart,
} from '../utils/monitoring-date.util';
import { formatInTimeZone } from 'date-fns-tz';

const WEEKDAY_CODES = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'] as const;

@Injectable()
export class MonitorChecksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly monitorAccessService: MonitorAccessService,
  ) {}

  async create(
    monitorId: string,
    createCheckDto: CreateCheckDto,
  ): Promise<TScheduleComplianceCheck> {
    const assignedBuildingIds =
      await this.monitorAccessService.getAssignedBuildingIdsForCapture(
        monitorId,
      );
    const courseClassroom = await this.prisma.courseClassroom.findUnique({
      where: { id: createCheckDto.courseClassroomId },
      select: {
        id: true,
        days: true,
        section: true,
        classroom: {
          select: {
            buildingId: true,
            digitalBlackboards: { select: { id: true }, take: 1 },
          },
        },
        teachingSession: {
          select: {
            assignmentReport: {
              select: {
                period: { select: { startDate: true, endDate: true } },
              },
            },
          },
        },
      },
    });

    if (!courseClassroom)
      throw new NotFoundException(
        `La sección de asignatura con id <${createCheckDto.courseClassroomId}> no fue encontrada.`,
      );

    if (!assignedBuildingIds.includes(courseClassroom.classroom.buildingId)) {
      throw new ForbiddenException(
        'La sección no pertenece a un edificio asignado al monitor.',
      );
    }

    const hasDigitalBlackboard =
      courseClassroom.classroom.digitalBlackboards.length > 0;
    const useStatus = createCheckDto.digitalBlackboardUseStatus;

    if (!createCheckDto.isPresent && useStatus) {
      throw new BadRequestException(
        'Una ausencia no puede registrar uso de pizarra digital.',
      );
    }

    if (createCheckDto.isPresent && hasDigitalBlackboard && !useStatus) {
      throw new BadRequestException(
        'Debe registrar el uso observado de la pizarra digital.',
      );
    }

    if (createCheckDto.isPresent && !hasDigitalBlackboard && useStatus) {
      throw new BadRequestException(
        'El aula no tiene una pizarra digital registrada.',
      );
    }

    const checkDate = monitoringDayStart(createCheckDto.checkDate);
    const period = courseClassroom.teachingSession.assignmentReport.period;
    const periodStart = formatInTimeZone(
      period.startDate,
      INSTITUTIONAL_TIME_ZONE,
      'yyyy-MM-dd',
    );
    const periodEnd = formatInTimeZone(
      period.endDate,
      INSTITUTIONAL_TIME_ZONE,
      'yyyy-MM-dd',
    );
    if (
      createCheckDto.checkDate < periodStart ||
      createCheckDto.checkDate > periodEnd
    ) {
      throw new BadRequestException(
        'La fecha del chequeo está fuera del período académico de la clase.',
      );
    }
    const weekday = Number(
      formatInTimeZone(checkDate, INSTITUTIONAL_TIME_ZONE, 'i'),
    );
    const expectedDay = WEEKDAY_CODES[weekday - 1];
    const scheduledDays = parseCourseClassroomDays(courseClassroom.days);
    if (!expectedDay || !scheduledDays?.includes(expectedDay)) {
      throw new BadRequestException(
        'La clase no está programada para la fecha indicada.',
      );
    }
    const scheduledSection = parseCourseClassroomSection(
      courseClassroom.section,
    );
    if (
      !scheduledSection ||
      createCheckDto.checkTime < scheduledSection.startTime ||
      createCheckDto.checkTime > scheduledSection.endTime
    ) {
      throw new BadRequestException(
        'La hora del chequeo está fuera del horario programado de la clase.',
      );
    }

    if (createCheckDto.offlineId) {
      const replay = await this.prisma.scheduleComplianceCheck.findUnique({
        where: {
          monitorId_offlineId: {
            monitorId,
            offlineId: createCheckDto.offlineId,
          },
        },
      });

      if (replay) {
        if (!this.matchesReplay(replay, createCheckDto, checkDate)) {
          throw new ConflictException(
            'El identificador offline ya fue utilizado con otros datos.',
          );
        }

        return replay;
      }
    }

    const existingCheck = await this.prisma.scheduleComplianceCheck.findFirst({
      where: {
        courseClassroomId: createCheckDto.courseClassroomId,
        checkDate,
      },
    });

    if (existingCheck)
      throw new ConflictException(
        'Ya existe una verificación registrada para esta sección de asignatura en la fecha indicada.',
      );

    try {
      return await this.prisma.scheduleComplianceCheck.create({
        data: {
          courseClassroomId: createCheckDto.courseClassroomId,
          monitorId,
          buildingId: courseClassroom.classroom.buildingId,
          checkDate,
          checkTime: createCheckDto.checkTime,
          isPresent: createCheckDto.isPresent,
          observation: createCheckDto.observation,
          digitalBlackboardUseStatus:
            createCheckDto.isPresent && hasDigitalBlackboard ? useStatus : null,
          offlineId: createCheckDto.offlineId,
          syncedAt: createCheckDto.offlineId ? new Date() : null,
        },
      });
    } catch (error) {
      if (!createCheckDto.offlineId) throw error;
      const replay = await this.prisma.scheduleComplianceCheck.findUnique({
        where: {
          monitorId_offlineId: {
            monitorId,
            offlineId: createCheckDto.offlineId,
          },
        },
      });
      if (!replay) throw error;
      if (!this.matchesReplay(replay, createCheckDto, checkDate)) {
        throw new ConflictException(
          'El identificador offline ya fue utilizado con otros datos.',
        );
      }
      return replay;
    }
  }

  async findAllWithFilters(
    userId: string,
    query: CheckFiltersDto,
  ): Promise<IPaginateOutput<TScheduleComplianceCheckDetail>> {
    const scope = await this.monitorAccessService.resolveReadScope(userId);
    const buildingIds =
      scope.type === 'buildings' ? scope.buildingIds : undefined;

    if (
      query.buildingId &&
      buildingIds &&
      !buildingIds.includes(query.buildingId)
    ) {
      throw new ForbiddenException(
        'El edificio solicitado no pertenece al alcance del monitor.',
      );
    }

    const where = buildCheckWhere(query, buildingIds);

    const [checks, count] = await Promise.all([
      this.prisma.scheduleComplianceCheck.findMany({
        where,
        ...paginate(query),
        orderBy: [{ checkDate: 'desc' }, { checkTime: 'desc' }, { id: 'desc' }],
        include: {
          monitor: { select: { id: true, name: true } },
          building: { select: { id: true, name: true } },
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
      ({ courseClassroom, monitor, building, ...check }) => ({
        ...check,
        monitor,
        courseClassroom: {
          id: courseClassroom.id,
          section: courseClassroom.section,
          days: courseClassroom.days,
          course: courseClassroom.course,
          classroom: {
            ...courseClassroom.classroom,
            building,
          },
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

  private matchesReplay(
    replay: TScheduleComplianceCheck,
    dto: CreateCheckDto,
    checkDate: Date,
  ): boolean {
    return (
      replay.courseClassroomId === dto.courseClassroomId &&
      replay.checkDate.getTime() === checkDate.getTime() &&
      replay.checkTime === dto.checkTime &&
      replay.isPresent === dto.isPresent &&
      replay.observation === (dto.observation ?? null) &&
      replay.digitalBlackboardUseStatus ===
        (dto.digitalBlackboardUseStatus ?? null)
    );
  }
}
