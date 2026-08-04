import { ForbiddenException, Injectable } from '@nestjs/common';
import { formatInTimeZone } from 'date-fns-tz';
import { DigitalBlackboardUseStatus } from 'src/generated/prisma/client';
import { buildCheckWhere } from 'src/modules/monitor/utils/build-check-where.util';
import { INSTITUTIONAL_TIME_ZONE } from 'src/modules/monitor/utils/monitoring-date.util';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  MonitoringDetailsDto,
  MonitoringExportDto,
  MonitoringFiltersDto,
} from '../dto';
import { AnalyticsCoverage, AnalyticsMetricResult } from '../types';
import { AnalyticsScopeService } from './analytics-scope.service';

export type MonitoringDetailRow = {
  checkId: string;
  checkDate: Date;
  checkTime: string;
  isPresent: boolean;
  observation: string | null;
  digitalBlackboardUseStatus: DigitalBlackboardUseStatus | null;
  monitorId: string;
  monitorName: string;
  sectionId: string;
  courseCode: string;
  courseName: string;
  groupCode: string;
  teacherId: string;
  teacherName: string;
  classroomId: string;
  classroomName: string;
  buildingId: string;
  buildingName: string;
  centerId: string;
  centerName: string;
  centerDepartmentId: string;
  centerDepartmentName: string;
  periodId: string;
  periodLabel: string;
};

type MonitoringDistributionItem = {
  id: string;
  label: string;
  totalChecks: number;
  present: number;
  absent: number;
  complianceRate: number;
};

const MONITORING_NOTES = [
  'observed_digital_blackboard_use',
  'legacy_checks_without_blackboard_use_capture',
] as const;

@Injectable()
export class MonitoringAnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scopeService: AnalyticsScopeService,
  ) {}

  async getSummary(userId: string, filters: MonitoringFiltersDto) {
    const rows = await this.loadRows(userId, filters);
    const total = rows.length;
    const present = rows.filter((row) => row.isPresent).length;
    const used = rows.filter(
      (row) =>
        row.digitalBlackboardUseStatus === DigitalBlackboardUseStatus.USED,
    ).length;
    const notUsed = rows.filter(
      (row) =>
        row.digitalBlackboardUseStatus === DigitalBlackboardUseStatus.NOT_USED,
    ).length;
    const unknown = rows.filter(
      (row) =>
        row.digitalBlackboardUseStatus === DigitalBlackboardUseStatus.UNKNOWN,
    ).length;
    const eligible = used + notUsed + unknown;
    const determinate = used + notUsed;
    const observationCoverage = {
      included: determinate,
      total: eligible,
      excluded: unknown,
      reasons: unknown ? ['unknown_digital_blackboard_use'] : [],
    } satisfies AnalyticsCoverage;

    return {
      notes: MONITORING_NOTES,
      metrics: {
        totalChecks: this.metric('totalChecks', total, 'checks', 'complete'),
        presentChecks: this.metric(
          'presentChecks',
          present,
          'checks',
          'complete',
        ),
        absentChecks: this.metric(
          'absentChecks',
          total - present,
          'checks',
          'complete',
        ),
        complianceRate: {
          ...this.metric(
            'complianceRate',
            total ? (present / total) * 100 : null,
            'percentage',
            total ? 'complete' : 'not_applicable',
          ),
          numerator: present,
          denominator: total,
        },
        observedBlackboardUseRate: {
          ...this.metric(
            'observedBlackboardUseRate',
            determinate ? (used / determinate) * 100 : null,
            'percentage',
            determinate ? (unknown ? 'partial' : 'complete') : 'not_applicable',
            observationCoverage,
          ),
          numerator: used,
          denominator: determinate,
        },
        blackboardObservationCoverage: {
          ...this.metric(
            'blackboardObservationCoverage',
            eligible ? (determinate / eligible) * 100 : null,
            'percentage',
            eligible ? (unknown ? 'partial' : 'complete') : 'not_applicable',
            observationCoverage,
          ),
          numerator: determinate,
          denominator: eligible,
        },
      },
      distributions: {
        byDay: this.distribution(rows, (row) => {
          const day = formatInTimeZone(
            row.checkDate,
            INSTITUTIONAL_TIME_ZONE,
            'yyyy-MM-dd',
          );
          return [day, day];
        }),
        byTeacher: this.distribution(rows, (row) => [
          row.teacherId,
          row.teacherName,
        ]),
        byBuilding: this.distribution(rows, (row) => [
          row.buildingId,
          row.buildingName,
        ]),
        byCenter: this.distribution(rows, (row) => [
          row.centerId,
          row.centerName,
        ]),
        byCenterDepartment: this.distribution(rows, (row) => [
          row.centerDepartmentId,
          row.centerDepartmentName,
        ]),
        byPeriod: this.distribution(rows, (row) => [
          row.periodId,
          row.periodLabel,
        ]),
        blackboardUseStatus: [
          { id: 'USED', label: 'Usada', value: used },
          { id: 'NOT_USED', label: 'No usada', value: notUsed },
          { id: 'UNKNOWN', label: 'Desconocido', value: unknown },
        ],
      },
    };
  }

  async getDetails(userId: string, filters: MonitoringDetailsDto) {
    const page = Number(filters.page ?? '1');
    const size = Number(filters.size ?? '25');
    const rows = await this.buildRows(userId, filters);
    const start = (page - 1) * size;
    return {
      metric: filters.metric,
      rows: rows.slice(start, start + size),
      meta: { page, size, total: rows.length },
      notes: MONITORING_NOTES,
    };
  }

  getExportRows(
    userId: string,
    filters: MonitoringExportDto,
  ): Promise<MonitoringDetailRow[]> {
    return this.buildRows(userId, filters);
  }

  private async buildRows(
    userId: string,
    filters: MonitoringExportDto,
  ): Promise<MonitoringDetailRow[]> {
    let rows = await this.loadRows(userId, filters);
    if (filters.metric === 'digital_blackboard_use') {
      rows = rows.filter(
        ({ digitalBlackboardUseStatus }) => digitalBlackboardUseStatus !== null,
      );
    }
    this.sortRows(rows, filters.sort);
    return rows;
  }

  private async loadRows(
    userId: string,
    filters: MonitoringFiltersDto,
  ): Promise<MonitoringDetailRow[]> {
    const domainScope = await this.scopeService.getDomainScope(
      userId,
      'monitoring',
    );
    if (!domainScope.branches.length) {
      throw new ForbiddenException('No tiene acceso a Analytics de monitoreo.');
    }
    const scope = this.scopeService.intersectRequestedScope(
      domainScope,
      filters.buildingId ? { buildingIds: [filters.buildingId] } : {},
    );
    const global = scope.branches.some((branch) => branch.type === 'global');
    const buildingIds = global
      ? undefined
      : [
          ...new Set(
            scope.branches.flatMap((branch) =>
              branch.type === 'buildings' ? branch.buildingIds : [],
            ),
          ),
        ];
    const where = buildCheckWhere(filters, buildingIds);
    const checks = await this.prisma.scheduleComplianceCheck.findMany({
      where,
      select: {
        id: true,
        checkDate: true,
        checkTime: true,
        isPresent: true,
        observation: true,
        digitalBlackboardUseStatus: true,
        monitor: { select: { id: true, name: true } },
        building: {
          select: {
            id: true,
            name: true,
            center: { select: { id: true, name: true } },
          },
        },
        courseClassroom: {
          select: {
            id: true,
            groupCode: true,
            course: { select: { code: true, name: true } },
            classroom: {
              select: {
                id: true,
                name: true,
                building: {
                  select: {
                    id: true,
                    name: true,
                    center: { select: { id: true, name: true } },
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

    return checks.map((check) => {
      const section = check.courseClassroom;
      const report = section.teachingSession.assignmentReport;
      const building = check.building;
      return {
        checkId: check.id,
        checkDate: check.checkDate,
        checkTime: check.checkTime,
        isPresent: check.isPresent,
        observation: check.observation,
        digitalBlackboardUseStatus: check.digitalBlackboardUseStatus,
        monitorId: check.monitor.id,
        monitorName: check.monitor.name,
        sectionId: section.id,
        courseCode: section.course.code,
        courseName: section.course.name,
        groupCode: section.groupCode,
        teacherId: report.teacher.id,
        teacherName: report.teacher.user.name,
        classroomId: section.classroom.id,
        classroomName: section.classroom.name,
        buildingId: building.id,
        buildingName: building.name,
        centerId: building.center.id,
        centerName: building.center.name,
        centerDepartmentId: report.centerDepartment.id,
        centerDepartmentName: `${report.centerDepartment.center.name} - ${report.centerDepartment.department.name}`,
        periodId: report.period.id,
        periodLabel: `No. ${report.period.pac}, ${report.period.pac_modality}, ${report.period.year}`,
      };
    });
  }

  private distribution(
    rows: MonitoringDetailRow[],
    key: (row: MonitoringDetailRow) => readonly [string, string],
  ): MonitoringDistributionItem[] {
    const groups = new Map<string, MonitoringDistributionItem>();
    for (const row of rows) {
      const [id, label] = key(row);
      const current = groups.get(id) ?? {
        id,
        label,
        totalChecks: 0,
        present: 0,
        absent: 0,
        complianceRate: 0,
      };
      current.totalChecks += 1;
      if (row.isPresent) current.present += 1;
      else current.absent += 1;
      current.complianceRate = (current.present / current.totalChecks) * 100;
      groups.set(id, current);
    }
    return [...groups.values()].sort(
      (left, right) =>
        left.label.localeCompare(right.label, 'es') ||
        left.id.localeCompare(right.id),
    );
  }

  private metric(
    key: string,
    value: number | null,
    unit: AnalyticsMetricResult['unit'],
    dataStatus: AnalyticsMetricResult['dataStatus'],
    coverage?: AnalyticsCoverage,
  ): AnalyticsMetricResult {
    return {
      key,
      value,
      unit,
      dataStatus,
      ...(coverage ? { coverage } : {}),
      notes: [...MONITORING_NOTES],
    };
  }

  private sortRows(
    rows: MonitoringDetailRow[],
    sort: MonitoringExportDto['sort'],
  ): void {
    const [field, order] = (sort ?? 'checkDate:desc').split(':');
    const direction = order === 'asc' ? 1 : -1;
    rows.sort((left, right) => {
      const compared =
        field === 'teacherName'
          ? left.teacherName.localeCompare(right.teacherName, 'es')
          : field === 'buildingName'
            ? left.buildingName.localeCompare(right.buildingName, 'es')
            : left.checkDate.getTime() - right.checkDate.getTime() ||
              left.checkTime.localeCompare(right.checkTime);
      return compared * direction || left.checkId.localeCompare(right.checkId);
    });
  }
}
