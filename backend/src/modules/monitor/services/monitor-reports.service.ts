import { Injectable } from '@nestjs/common';
import { formatISO } from 'date-fns';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReportFiltersDto } from '../dto';
import { EReportGroupBy } from '../enums';
import { TMonitorReport, TMonitorReportSummary } from '../types';
import { buildCheckWhere } from '../utils/build-check-where.util';

type TReportCheck = {
  checkDate: Date;
  isPresent: boolean;
  courseClassroom: {
    classroom: {
      building: { id: string; name: string };
    };
    teachingSession: {
      assignmentReport: {
        teacher: { id: string; user: { name: string } };
      };
    };
  };
};

@Injectable()
export class MonitorReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getReport(query: ReportFiltersDto): Promise<TMonitorReport> {
    const where = buildCheckWhere(query);

    const checks = await this.prisma.scheduleComplianceCheck.findMany({
      where,
      select: {
        checkDate: true,
        isPresent: true,
        courseClassroom: {
          select: {
            classroom: {
              select: { building: { select: { id: true, name: true } } },
            },
            teachingSession: {
              select: {
                assignmentReport: {
                  select: {
                    teacher: {
                      select: {
                        id: true,
                        user: { select: { name: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const summary = this.summarize(checks);

    if (!query.groupBy) return summary;

    const groupsMap = new Map<
      string,
      { label: string; items: TReportCheck[] }
    >();

    for (const check of checks) {
      const { key, label } = this.resolveGroupKey(check, query.groupBy);

      if (!groupsMap.has(key)) groupsMap.set(key, { label, items: [] });
      groupsMap.get(key)!.items.push(check);
    }

    const groups = Array.from(groupsMap.entries()).map(
      ([groupKey, { label, items }]) => ({
        groupKey,
        groupLabel: label,
        ...this.summarize(items),
      }),
    );

    return { ...summary, groups };
  }

  private summarize(checks: { isPresent: boolean }[]): TMonitorReportSummary {
    const totalChecks = checks.length;
    const present = checks.filter((check) => check.isPresent).length;
    const absent = totalChecks - present;
    const complianceRate =
      totalChecks > 0 ? Number(((present / totalChecks) * 100).toFixed(2)) : 0;

    return { totalChecks, present, absent, complianceRate };
  }

  private resolveGroupKey(
    check: TReportCheck,
    groupBy: EReportGroupBy,
  ): { key: string; label: string } {
    switch (groupBy) {
      case EReportGroupBy.TEACHER: {
        const teacher =
          check.courseClassroom.teachingSession.assignmentReport.teacher;
        return { key: teacher.id, label: teacher.user.name };
      }
      case EReportGroupBy.BUILDING: {
        const building = check.courseClassroom.classroom.building;
        return { key: building.id, label: building.name };
      }
      case EReportGroupBy.DAY:
      default: {
        const dateKey = formatISO(check.checkDate, { representation: 'date' });
        return { key: dateKey, label: dateKey };
      }
    }
  }
}
