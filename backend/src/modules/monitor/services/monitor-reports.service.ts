import { ForbiddenException, Injectable } from '@nestjs/common';
import { formatISO } from 'date-fns';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReportFiltersDto } from '../dto';
import { EReportGroupBy } from '../enums';
import { TMonitorReport, TMonitorReportSummary } from '../types';
import { buildCheckWhere } from '../utils/build-check-where.util';
import { MonitorAccessService } from './monitor-access.service';

type TReportCheck = {
  checkDate: Date;
  isPresent: boolean;
  building: {
    id: string;
    name: string;
    center: { id: string; name: string };
  };
  courseClassroom: {
    classroom: {
      building: { id: string; name: string };
    };
    teachingSession: {
      assignmentReport: {
        teacher: { id: string; user: { name: string } };
        centerDepartment: {
          id: string;
          center: { name: string };
          department: { name: string };
        };
        period: { id: string; year: number; pac: number; pac_modality: string };
      };
    };
  };
};

@Injectable()
export class MonitorReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly monitorAccessService: MonitorAccessService,
  ) {}

  async getReport(
    userId: string,
    query: ReportFiltersDto,
  ): Promise<TMonitorReport> {
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

    const checks = await this.prisma.scheduleComplianceCheck.findMany({
      where,
      select: {
        checkDate: true,
        isPresent: true,
        building: {
          select: {
            id: true,
            name: true,
            center: { select: { id: true, name: true } },
          },
        },
        courseClassroom: {
          select: {
            classroom: {
              select: {
                building: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
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
                    centerDepartment: {
                      select: {
                        id: true,
                        center: { select: { name: true } },
                        department: { select: { name: true } },
                      },
                    },
                    period: {
                      select: {
                        id: true,
                        year: true,
                        pac: true,
                        pac_modality: true,
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

    const groups = Array.from(groupsMap.entries())
      .map(([groupKey, { label, items }]) => ({
        groupKey,
        groupLabel: label,
        ...this.summarize(items),
      }))
      .sort((left, right) => left.groupLabel.localeCompare(right.groupLabel));

    return { ...summary, groups };
  }

  private summarize(checks: { isPresent: boolean }[]): TMonitorReportSummary {
    const totalChecks = checks.length;
    const present = checks.filter((check) => check.isPresent).length;
    const absent = totalChecks - present;
    const complianceRate =
      totalChecks > 0
        ? Number(((present / totalChecks) * 100).toFixed(2))
        : null;

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
        const building = check.building;
        return { key: building.id, label: building.name };
      }
      case EReportGroupBy.CENTER: {
        const center = check.building.center;
        return { key: center.id, label: center.name };
      }
      case EReportGroupBy.CENTER_DEPARTMENT: {
        const centerDepartment =
          check.courseClassroom.teachingSession.assignmentReport
            .centerDepartment;
        return {
          key: centerDepartment.id,
          label: `${centerDepartment.department.name} - ${centerDepartment.center.name}`,
        };
      }
      case EReportGroupBy.PERIOD: {
        const period =
          check.courseClassroom.teachingSession.assignmentReport.period;
        return {
          key: period.id,
          label: `${period.pac} ${period.pac_modality} ${period.year}`,
        };
      }
      case EReportGroupBy.DAY:
      default: {
        const dateKey = formatISO(check.checkDate, { representation: 'date' });
        return { key: dateKey, label: dateKey };
      }
    }
  }
}
