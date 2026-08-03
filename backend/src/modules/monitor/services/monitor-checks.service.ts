import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { parseISO, startOfDay } from 'date-fns';
import { IPaginateOutput } from 'src/common/interfaces';
import { paginate, paginateOutput } from 'src/common/utils';
import { PrismaService } from 'src/prisma/prisma.service';
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
        `La seccion de asignatura con id <${createCheckDto.courseClassroomId}> no fue encontrada.`,
      );

    const checkDate = startOfDay(parseISO(createCheckDto.checkDate));
    const existingCheck = await this.prisma.scheduleComplianceCheck.findUnique({
      where: {
        courseClassroomId_checkDate: {
          courseClassroomId: createCheckDto.courseClassroomId,
          checkDate,
        },
      },
    });

    if (existingCheck)
      throw new BadRequestException(
        'Ya existe una verificacion registrada para esta seccion de asignatura en la fecha indicada.',
      );

    return this.prisma.scheduleComplianceCheck.create({
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
      select: { id: true },
    });
    const validIds = new Set(courseClassrooms.map(({ id }) => id));
    const checksToProcess = dto.checks.filter((check) => {
      if (validIds.has(check.courseClassroomId)) return true;
      if (check.offlineId) rejectedIds.push(check.offlineId);
      return false;
    });

    for (let start = 0; start < checksToProcess.length; start += 25) {
      const batch = checksToProcess.slice(start, start + 25);
      const results = await Promise.allSettled(
        batch.map(async (check) => {
          const checkDate = startOfDay(parseISO(check.checkDate));
          const rows = await this.prisma.$queryRaw<Array<{ monitorId: string }>>(
            Prisma.sql`
              INSERT INTO "academic"."schedule_compliance_checks" (
                "id", "courseClassroomId", "monitorId", "checkDate", "checkTime",
                "isPresent", "observation", "offlineId", "syncedAt", "createdAt", "updatedAt"
              ) VALUES (
                gen_random_uuid(), ${check.courseClassroomId}::uuid, ${monitorId}::uuid,
                ${checkDate}, ${check.checkTime}, ${check.isPresent},
                ${check.observation ?? null}, ${check.offlineId ?? null}, NOW(), NOW(), NOW()
              )
              ON CONFLICT ("courseClassroomId", "checkDate") DO UPDATE
              SET "checkTime" = EXCLUDED."checkTime",
                  "isPresent" = EXCLUDED."isPresent",
                  "observation" = EXCLUDED."observation",
                  "offlineId" = EXCLUDED."offlineId",
                  "syncedAt" = NOW(),
                  "updatedAt" = NOW()
              WHERE "academic"."schedule_compliance_checks"."monitorId" = ${monitorId}::uuid
              RETURNING "monitorId"
            `,
          );
          return rows.length === 0 ? 'conflict' : 'synced';
        }),
      );

      results.forEach((result, index) => {
        const check = batch[index];
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
