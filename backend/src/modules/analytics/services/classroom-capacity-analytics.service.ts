import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ClassroomCapacityDetailsDto,
  ClassroomCapacityExportDto,
  ClassroomCapacityFiltersDto,
} from '../dto';
import {
  AnalyticsCoverage,
  AnalyticsCoverageReason,
  AnalyticsMetricNote,
  AnalyticsMetricResult,
} from '../types';
import {
  AnalyticsClassroom,
  ClassroomAnalyticsUniverseService,
} from './classroom-analytics-universe.service';

export type ClassroomCapacityRow = {
  classroomId: string;
  classroomName: string;
  buildingId: string;
  buildingName: string;
  centerId: string;
  centerName: string;
  roomTypeId: string;
  roomType: string;
  maxCapacity: number | null;
  capacityStatus: 'known' | 'missing' | 'invalid';
};

const CAPACITY_NOTES: AnalyticsMetricNote[] = [
  'current_classroom_catalog',
  'current_classroom_capacity',
];

@Injectable()
export class ClassroomCapacityAnalyticsService {
  constructor(
    private readonly universeService: ClassroomAnalyticsUniverseService,
  ) {}

  async getSummary(userId: string, filters: ClassroomCapacityFiltersDto) {
    const rows = await this.buildRows(userId, filters);
    const known = rows.filter(
      ({ capacityStatus }) => capacityStatus === 'known',
    );
    const coverage = this.coverage(rows, known.length);
    const total = rows.length;
    const installedCapacity =
      total === 0
        ? 0
        : known.length
          ? known.reduce((sum, row) => sum + row.maxCapacity!, 0)
          : null;
    const installedStatus =
      total === 0
        ? 'complete'
        : known.length === 0
          ? 'unavailable'
          : known.length === total
            ? 'complete'
            : 'partial';

    return {
      periodId: filters.periodId,
      notes: CAPACITY_NOTES,
      metrics: {
        installedCapacity: {
          key: 'installedCapacity',
          value: installedCapacity,
          unit: 'capacity',
          dataStatus: installedStatus,
          coverage,
          notes: CAPACITY_NOTES,
        } satisfies AnalyticsMetricResult,
        capacityDataCoverage: {
          key: 'capacityDataCoverage',
          value: total ? (known.length / total) * 100 : null,
          unit: 'percentage',
          dataStatus:
            total === 0
              ? 'not_applicable'
              : known.length === 0
                ? 'unavailable'
                : known.length === total
                  ? 'complete'
                  : 'partial',
          numerator: known.length,
          denominator: total,
          coverage,
          notes: CAPACITY_NOTES,
        } satisfies AnalyticsMetricResult,
      },
    };
  }

  async getDetails(userId: string, filters: ClassroomCapacityDetailsDto) {
    const page = Number(filters.page ?? '1');
    const size = Number(filters.size ?? '25');
    this.validatePagination(page, size);
    const rows = await this.buildRows(userId, filters);
    const start = (page - 1) * size;
    return {
      metric: filters.metric,
      periodId: filters.periodId,
      notes: CAPACITY_NOTES,
      rows: rows.slice(start, start + size),
      meta: { page, size, total: rows.length },
    };
  }

  getExportRows(
    userId: string,
    filters: ClassroomCapacityExportDto,
  ): Promise<ClassroomCapacityRow[]> {
    return this.buildRows(userId, filters);
  }

  private async buildRows(
    userId: string,
    filters: ClassroomCapacityFiltersDto & {
      sort?: ClassroomCapacityExportDto['sort'];
    },
  ) {
    const { classrooms } = await this.universeService.load(
      userId,
      filters.periodId,
      filters.centerDepartmentId,
      'classrooms',
    );
    const rows = classrooms.map((classroom) => this.toRow(classroom));
    this.sortRows(rows, filters.sort);
    return rows;
  }

  private toRow(classroom: AnalyticsClassroom): ClassroomCapacityRow {
    return {
      classroomId: classroom.id,
      classroomName: classroom.name,
      buildingId: classroom.building.id,
      buildingName: classroom.building.name,
      centerId: classroom.building.center.id,
      centerName: classroom.building.center.name,
      roomTypeId: classroom.roomType.id,
      roomType: classroom.roomType.description,
      maxCapacity: classroom.maxCapacity,
      capacityStatus:
        classroom.maxCapacity === null
          ? 'missing'
          : classroom.maxCapacity > 0
            ? 'known'
            : 'invalid',
    };
  }

  private coverage(rows: ClassroomCapacityRow[], included: number) {
    const reasons = new Set<AnalyticsCoverageReason>();
    if (rows.some(({ capacityStatus }) => capacityStatus === 'missing')) {
      reasons.add('missing_classroom_capacity');
    }
    if (rows.some(({ capacityStatus }) => capacityStatus === 'invalid')) {
      reasons.add('invalid_classroom_capacity');
    }
    return {
      included,
      total: rows.length,
      excluded: rows.length - included,
      reasons: [
        'missing_classroom_capacity',
        'invalid_classroom_capacity',
      ].filter((reason) => reasons.has(reason as AnalyticsCoverageReason)),
    } as AnalyticsCoverage;
  }

  private sortRows(
    rows: ClassroomCapacityRow[],
    sort: ClassroomCapacityExportDto['sort'],
  ) {
    const [field, order] = (sort ?? 'classroomName:asc').split(':') as [
      'classroomName' | 'buildingName' | 'maxCapacity' | 'capacityStatus',
      'asc' | 'desc',
    ];
    const direction = order === 'asc' ? 1 : -1;
    rows.sort((left, right) => {
      const leftValue = left[field];
      const rightValue = right[field];
      if (leftValue === null && rightValue !== null) return 1;
      if (leftValue !== null && rightValue === null) return -1;
      const compared =
        typeof leftValue === 'number' && typeof rightValue === 'number'
          ? leftValue - rightValue
          : String(leftValue).localeCompare(String(rightValue), 'es');
      return (
        compared * direction ||
        left.classroomId.localeCompare(right.classroomId)
      );
    });
  }

  private validatePagination(page: number, size: number) {
    if (
      !Number.isInteger(page) ||
      !Number.isInteger(size) ||
      page < 1 ||
      size < 1 ||
      size > 100
    ) {
      throw new BadRequestException(
        '<page> debe ser mayor a cero y <size> debe estar entre 1 y 100.',
      );
    }
  }
}
