import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { IPaginateOutput } from 'src/common/interfaces';
import { paginate, paginateOutput } from 'src/common/utils';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  BatchSyncChecksDto,
  CheckFiltersDto,
  CreateCheckDto,
  UpdateCheckDto,
} from '../dto';
import {
  TScheduleComplianceCheck,
  TScheduleComplianceCheckDetail,
} from '../types';
import { buildCheckWhere } from '../utils/build-check-where.util';
import { MonitorAccessService } from './monitor-access.service';
import { monitoringDayStart } from '../utils/monitoring-date.util';

@Injectable()
export class MonitorChecksService {
  private readonly logger = new Logger(MonitorChecksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly monitorAccessService: MonitorAccessService,
  ) {}

  async create(
    monitorId: string,
    createCheckDto: CreateCheckDto,
  ): Promise<TScheduleComplianceCheck> {
    const courseClassroom = await this.prisma.courseClassroom.findUnique({
      where: { id: createCheckDto.courseClassroomId },
      select: {
        id: true,
        classroom: { select: { buildingId: true } },
      },
    });

    if (!courseClassroom)
      throw new NotFoundException(
        `La seccion de asignatura con id <${createCheckDto.courseClassroomId}> no fue encontrada.`,
      );

    const checkDate = monitoringDayStart(createCheckDto.checkDate);

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

    if (existingCheck) {
      throw new ConflictException(
        'Ya existe una verificación registrada para esta sección de asignatura en la fecha indicada.',
      );
    }

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
            createCheckDto.digitalBlackboardUseStatus ?? null,
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

  async batchSync(
    monitorId: string,
    dto: BatchSyncChecksDto,
  ): Promise<{
    synced: number;
    conflicts: number;
    skipped: number;
    rejected: number;
    conflictIds: string[];
    skippedIds: string[];
    rejectedIds: string[];
  }> {
    const syncedIds: string[] = [];
    const conflictIds: string[] = [];
    const skippedIds: string[] = [];
    const rejectedIds: string[] = [];
    const courseClassroomIds = [
      ...new Set(dto.checks.map((check) => check.courseClassroomId)),
    ];
    const courseClassrooms = await this.prisma.courseClassroom.findMany({
      where: { id: { in: courseClassroomIds } },
      select: {
        id: true,
        classroom: { select: { buildingId: true } },
      },
    });
    const courseClassroomsById = new Map(
      courseClassrooms.map((courseClassroom) => [
        courseClassroom.id,
        courseClassroom,
      ]),
    );
    const checksToProcess: Array<{
      check: CreateCheckDto;
      checkDate: Date;
      buildingId: string;
      digitalBlackboardUseStatus:
        | CreateCheckDto['digitalBlackboardUseStatus']
        | null;
    }> = [];

    for (const check of dto.checks) {
      const courseClassroom = courseClassroomsById.get(check.courseClassroomId);
      if (!courseClassroom) {
        if (check.offlineId) rejectedIds.push(check.offlineId);
        continue;
      }

      checksToProcess.push({
        check,
        checkDate: monitoringDayStart(check.checkDate),
        buildingId: courseClassroom.classroom.buildingId,
        digitalBlackboardUseStatus: check.digitalBlackboardUseStatus ?? null,
      });
    }

    for (let start = 0; start < checksToProcess.length; start += 25) {
      const batch = checksToProcess.slice(start, start + 25);
      const results = await Promise.allSettled(
        batch.map(async (entry) => {
          const { check, checkDate, buildingId, digitalBlackboardUseStatus } =
            entry;
          const rows = await this.prisma.$queryRaw<
            Array<{ monitorId: string }>
          >(
            Prisma.sql`
              INSERT INTO "academic"."schedule_compliance_checks" (
                "id", "courseClassroomId", "monitorId", "buildingId", "checkDate",
                "checkTime", "isPresent", "digitalBlackboardUseStatus", "observation",
                "offlineId", "syncedAt", "createdAt", "updatedAt"
              ) VALUES (
                gen_random_uuid(), ${check.courseClassroomId}::uuid, ${monitorId}::uuid,
                ${buildingId}::uuid, ${checkDate}, ${check.checkTime}, ${check.isPresent},
                ${digitalBlackboardUseStatus}::"academic"."DigitalBlackboardUseStatus",
                ${check.observation ?? null}, ${check.offlineId ?? null}, NOW(), NOW(), NOW()
              )
              ON CONFLICT ("courseClassroomId", "checkDate") DO UPDATE
              SET "checkTime" = EXCLUDED."checkTime",
                  "isPresent" = EXCLUDED."isPresent",
                  "digitalBlackboardUseStatus" = EXCLUDED."digitalBlackboardUseStatus",
                  "observation" = EXCLUDED."observation",
                  "offlineId" = EXCLUDED."offlineId",
                  "syncedAt" = NOW(),
                  "updatedAt" = NOW()
              WHERE "academic"."schedule_compliance_checks"."monitorId" = ${monitorId}::uuid
                AND "academic"."schedule_compliance_checks"."offlineId" = EXCLUDED."offlineId"
              RETURNING "monitorId"
            `,
          );
          return rows.length === 0 ? 'conflict' : 'synced';
        }),
      );

      results.forEach((result, index) => {
        const { check } = batch[index];
        if (result.status === 'fulfilled') {
          if (!check.offlineId) return;
          if (result.value === 'synced') syncedIds.push(check.offlineId);
          else conflictIds.push(check.offlineId);
          return;
        }

        if (check.offlineId) skippedIds.push(check.offlineId);
        this.logger.warn(
          `Unable to sync offline check <${check.offlineId}> for monitor <${monitorId}>.`,
          result.reason instanceof Error
            ? result.reason.stack
            : String(result.reason),
        );
      });
    }

    return {
      synced: syncedIds.length,
      conflicts: conflictIds.length,
      skipped: skippedIds.length,
      rejected: rejectedIds.length,
      conflictIds,
      skippedIds,
      rejectedIds,
    };
  }

  async update(
    monitorId: string,
    id: string,
    updateCheckDto: UpdateCheckDto,
  ): Promise<TScheduleComplianceCheck> {
    const check = await this.prisma.scheduleComplianceCheck.findUnique({
      where: { id },
    });

    if (!check)
      throw new NotFoundException(
        `La verificación con id <${id}> no fue encontrada.`,
      );

    if (check.monitorId !== monitorId)
      throw new ForbiddenException(
        'No tienes permiso para modificar esta verificación.',
      );

    const digitalBlackboardUseStatus =
      updateCheckDto.isPresent === false
        ? null
        : (updateCheckDto.digitalBlackboardUseStatus ??
          check.digitalBlackboardUseStatus);

    return this.prisma.scheduleComplianceCheck.update({
      where: { id },
      data: {
        isPresent: updateCheckDto.isPresent,
        ...(updateCheckDto.observation !== undefined
          ? { observation: updateCheckDto.observation.trim() || null }
          : {}),
        digitalBlackboardUseStatus,
      },
    });
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
                  digitalBlackboards: { select: { id: true }, take: 1 },
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
            name: courseClassroom.classroom.name,
            hasDigitalBlackboard:
              courseClassroom.classroom.digitalBlackboards.length > 0,
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
