import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { parseISO, startOfDay } from 'date-fns';
import { PrismaService } from 'src/prisma/prisma.service';
import { IPaginateOutput } from 'src/common/interfaces';
import { paginate, paginateOutput } from 'src/common/utils';
import { BatchSyncChecksDto, CheckFiltersDto, CreateCheckDto } from '../dto';
import {
  TScheduleComplianceCheck,
  TScheduleComplianceCheckDetail,
} from '../types';
import { buildCheckWhere } from '../utils/build-check-where.util';

@Injectable()
export class MonitorChecksService {
  private readonly logger = new Logger(MonitorChecksService.name);

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

  async batchSync(
    monitorId: string,
    dto: BatchSyncChecksDto,
  ): Promise<{
    synced: number;
    conflicts: number;
    skipped: number;
    conflictIds: string[];
    skippedIds: string[];
  }> {
    const syncedIds: string[] = [];
    const conflictIds: string[] = [];
    const skippedIds: string[] = [];

    const results = await Promise.allSettled(
      dto.checks.map(async (check) => {
        const checkDate = startOfDay(parseISO(check.checkDate));
        const where = {
          courseClassroomId_checkDate_checkTime: {
            courseClassroomId: check.courseClassroomId,
            checkDate,
            checkTime: check.checkTime,
          },
        };

        const existing = await this.prisma.scheduleComplianceCheck.findUnique({
          where,
          select: { monitorId: true },
        });

        if (!existing) {
          await this.prisma.scheduleComplianceCheck.create({
            data: {
              courseClassroomId: check.courseClassroomId,
              monitorId,
              checkDate,
              checkTime: check.checkTime,
              isPresent: check.isPresent,
              observation: check.observation,
              offlineId: check.offlineId,
              syncedAt: new Date(),
            },
          });

          return 'synced';
        }

        if (existing.monitorId === monitorId) {
          // Mismo monitor: la última verificación registrada prevalece
          await this.prisma.scheduleComplianceCheck.update({
            where,
            data: {
              isPresent: check.isPresent,
              observation: check.observation,
              syncedAt: new Date(),
            },
          });

          return 'synced';
        }

        // Otro monitor ya registró esta clave: no se sobreescribe, se reporta como conflicto
        return 'conflict';
      }),
    );

    results.forEach((result, index) => {
      const check = dto.checks[index];

      if (result.status === 'fulfilled') {
        if (!check.offlineId) return;

        if (result.value === 'synced') syncedIds.push(check.offlineId);
        else conflictIds.push(check.offlineId);
      } else {
        if (check.offlineId) skippedIds.push(check.offlineId);
        this.logger.warn(
          `No se pudo sincronizar la verificación offline <${check.offlineId}> del monitor <${monitorId}>.`,
          result.reason instanceof Error
            ? result.reason.stack
            : String(result.reason),
        );
      }
    });

    return {
      synced: syncedIds.length,
      conflicts: conflictIds.length,
      skipped: skippedIds.length,
      conflictIds,
      skippedIds,
    };
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
