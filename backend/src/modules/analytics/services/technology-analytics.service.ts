import { BadRequestException, Injectable } from '@nestjs/common';
import { EClassModality } from 'src/modules/course-classrooms/enums/modality.enum';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  TechnologyDetailMetric,
  TechnologyDetailsDto,
  TechnologyExportDto,
  TechnologyFiltersDto,
} from '../dto';
import {
  AnalyticsCoverage,
  AnalyticsMetricNote,
  AnalyticsMetricResult,
} from '../types';
import { analyticsScopeToCourseClassroomWhere } from '../utils';
import {
  AnalyticsClassroom,
  ClassroomAnalyticsUniverseService,
} from './classroom-analytics-universe.service';

type Board = {
  id: string;
  description: string | null;
  classroomId: string | null;
  condition: { id: string; status: string };
};
type Pc = {
  id: string;
  inventoryNumber: string;
  classroomId: string | null;
  condition: { id: string; status: string };
};
type AirConditioner = {
  id: string;
  description: string | null;
  classroomId: string | null;
  condition: { id: string; status: string };
};
type EquippedSection = {
  id: string;
  groupCode: string;
  studentCount: number | null;
  classroom: { id: string; name: string };
  course: { code: string; name: string };
  teachingSession: {
    assignmentReport: { teacher: { id: string; user: { name: string } } };
  };
};

export type TechnologyClassroomRow = {
  rowType: 'equipped_classroom';
  classroomId: string;
  classroomName: string;
  buildingId: string;
  buildingName: string;
  centerId: string;
  centerName: string;
  roomType: string;
  digitalBlackboardCount: number;
  equipped: boolean;
};
export type TechnologyEnrollmentRow = {
  rowType: 'equipped_classroom_enrollment';
  sectionId: string;
  courseCode: string;
  courseName: string;
  groupCode: string;
  teacherId: string;
  teacherName: string;
  classroomId: string;
  classroomName: string;
  studentCount: number | null;
  enrollmentStatus: 'known' | 'missing';
};
export type TechnologyInventoryRow = {
  rowType: 'equipment_inventory';
  equipmentKey: string;
  equipmentId: string;
  equipmentTypeId: 'digital_blackboard' | 'pc_equipment' | 'air_conditioner';
  equipmentType: string;
  itemLabel: string | null;
  conditionId: string;
  conditionLabel: string;
  classroomId: string;
  classroomName: string;
  buildingId: string;
  buildingName: string;
  centerId: string;
  centerName: string;
};
export type TechnologyDetailRow =
  | TechnologyClassroomRow
  | TechnologyEnrollmentRow
  | TechnologyInventoryRow;

type DistributionItem = {
  id: string;
  label: string;
  value: number;
  percentage: number;
};

const TECHNOLOGY_NOTES: AnalyticsMetricNote[] = [
  'current_classroom_catalog',
  'current_inventory_catalog',
  'potential_technology_coverage',
  'section_enrollments_not_unique_students',
];
const TYPE_LABELS = {
  digital_blackboard: 'Pizarra digital',
  pc_equipment: 'Equipo de cómputo',
  air_conditioner: 'Aire acondicionado',
} as const;

@Injectable()
export class TechnologyAnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly universeService: ClassroomAnalyticsUniverseService,
  ) {}

  async getSummary(userId: string, filters: TechnologyFiltersDto) {
    const { scope, classrooms } = await this.universeService.load(
      userId,
      filters.periodId,
      filters.centerDepartmentId,
      'technology',
    );
    const classroomIds = classrooms.map(({ id }) => id);
    const [boards, pcs, airConditioners] =
      await this.loadInventory(classroomIds);
    const equippedIds = new Set(boards.map(({ classroomId }) => classroomId!));
    const sections = await this.loadSections(scope, filters.periodId, [
      ...equippedIds,
    ]);
    const uniqueSections = [
      ...new Map(sections.map((section) => [section.id, section])).values(),
    ];
    const knownSections = uniqueSections.filter(
      ({ studentCount }) => studentCount !== null,
    );
    const knownEnrollments = knownSections.reduce(
      (sum, section) => sum + section.studentCount!,
      0,
    );
    const inventoryRows = this.inventoryRows(
      classrooms,
      boards,
      pcs,
      airConditioners,
    );
    const eligible = classrooms.length;
    const equipped = equippedIds.size;
    const sectionCoverage = this.coverage(
      knownSections.length,
      uniqueSections.length,
      knownSections.length === uniqueSections.length
        ? []
        : ['missing_enrollment'],
    );

    return {
      periodId: filters.periodId,
      notes: TECHNOLOGY_NOTES,
      metrics: {
        eligibleClassrooms: this.metric(
          'eligibleClassrooms',
          eligible,
          'classrooms',
          'complete',
        ),
        equippedClassrooms: this.metric(
          'equippedClassrooms',
          equipped,
          'classrooms',
          'complete',
        ),
        digitalBlackboardCoverage: {
          ...this.metric(
            'digitalBlackboardCoverage',
            eligible ? (equipped / eligible) * 100 : null,
            'percentage',
            eligible ? 'complete' : 'not_applicable',
          ),
          numerator: equipped,
          denominator: eligible,
        },
        knownEnrollmentsInEquippedClassrooms: {
          ...this.metric(
            'knownEnrollmentsInEquippedClassrooms',
            uniqueSections.length === 0
              ? 0
              : knownSections.length
                ? knownEnrollments
                : null,
            'enrollments',
            uniqueSections.length === 0
              ? 'complete'
              : knownSections.length === 0
                ? 'unavailable'
                : knownSections.length === uniqueSections.length
                  ? 'complete'
                  : 'partial',
          ),
          coverage: sectionCoverage,
        },
        equippedEnrollmentDataCoverage: {
          ...this.metric(
            'equippedEnrollmentDataCoverage',
            uniqueSections.length
              ? (knownSections.length / uniqueSections.length) * 100
              : null,
            'percentage',
            uniqueSections.length === 0
              ? 'not_applicable'
              : knownSections.length === 0
                ? 'unavailable'
                : knownSections.length === uniqueSections.length
                  ? 'complete'
                  : 'partial',
          ),
          numerator: knownSections.length,
          denominator: uniqueSections.length,
          coverage: sectionCoverage,
        },
        totalEquipment: this.metric(
          'totalEquipment',
          inventoryRows.length,
          'equipment',
          'complete',
        ),
      },
      distributions: {
        equipmentByType: this.distribution(
          inventoryRows,
          ({ equipmentTypeId, equipmentType }) => [
            equipmentTypeId,
            equipmentType,
          ],
        ),
        equipmentByCondition: this.distribution(
          inventoryRows,
          ({ conditionId, conditionLabel }) => [conditionId, conditionLabel],
        ),
        equipmentByBuilding: this.distribution(
          inventoryRows,
          ({ buildingId, buildingName }) => [buildingId, buildingName],
        ),
      },
    };
  }

  async getDetails(userId: string, filters: TechnologyDetailsDto) {
    const page = Number(filters.page ?? '1');
    const size = Number(filters.size ?? '25');
    this.validatePagination(page, size);
    const rows = await this.buildRows(userId, filters);
    const start = (page - 1) * size;
    return {
      metric: filters.metric,
      periodId: filters.periodId,
      notes: this.notesForMetric(filters.metric),
      rows: rows.slice(start, start + size),
      meta: { page, size, total: rows.length },
    };
  }

  getExportRows(
    userId: string,
    filters: TechnologyExportDto,
  ): Promise<TechnologyDetailRow[]> {
    return this.buildRows(userId, filters);
  }

  private async buildRows(
    userId: string,
    filters: TechnologyExportDto,
  ): Promise<TechnologyDetailRow[]> {
    this.validateSort(filters.metric, filters.sort);
    const { scope, classrooms } = await this.universeService.load(
      userId,
      filters.periodId,
      filters.centerDepartmentId,
      'technology',
    );
    const classroomIds = classrooms.map(({ id }) => id);
    let rows: TechnologyDetailRow[];

    if (filters.metric === 'equipment_inventory') {
      const [boards, pcs, airConditioners] =
        await this.loadInventory(classroomIds);
      rows = this.inventoryRows(classrooms, boards, pcs, airConditioners);
    } else {
      const boards = await this.loadBoards(classroomIds);
      const boardCount = new Map<string, number>();
      for (const board of boards) {
        boardCount.set(
          board.classroomId!,
          (boardCount.get(board.classroomId!) ?? 0) + 1,
        );
      }
      if (filters.metric === 'equipped_classrooms') {
        // Keep every eligible classroom so detail rows reconcile with the coverage denominator.
        rows = classrooms.map((classroom) =>
          this.classroomRow(classroom, boardCount.get(classroom.id) ?? 0),
        );
      } else {
        const sections = await this.loadSections(scope, filters.periodId, [
          ...boardCount.keys(),
        ]);
        rows = [
          ...new Map(sections.map((section) => [section.id, section])).values(),
        ].map((section) => this.enrollmentRow(section));
      }
    }
    this.sortRows(rows, filters.metric, filters.sort);
    return rows;
  }

  private loadInventory(classroomIds: string[]) {
    return Promise.all([
      this.loadBoards(classroomIds),
      classroomIds.length
        ? this.prisma.pcEquipment.findMany({
            where: { classroomId: { in: classroomIds } },
            select: {
              id: true,
              inventoryNumber: true,
              classroomId: true,
              condition: { select: { id: true, status: true } },
            },
          })
        : Promise.resolve([] as Pc[]),
      classroomIds.length
        ? this.prisma.airConditioner.findMany({
            where: { classroomId: { in: classroomIds } },
            select: {
              id: true,
              description: true,
              classroomId: true,
              condition: { select: { id: true, status: true } },
            },
          })
        : Promise.resolve([] as AirConditioner[]),
    ]);
  }

  private loadBoards(classroomIds: string[]) {
    return classroomIds.length
      ? this.prisma.digitalBlackboard.findMany({
          where: { classroomId: { in: classroomIds } },
          select: {
            id: true,
            description: true,
            classroomId: true,
            condition: { select: { id: true, status: true } },
          },
        })
      : Promise.resolve([] as Board[]);
  }

  private loadSections(
    scope: Parameters<typeof analyticsScopeToCourseClassroomWhere>[0],
    periodId: string,
    classroomIds: string[],
  ) {
    if (!classroomIds.length) return Promise.resolve([] as EquippedSection[]);
    return this.prisma.courseClassroom.findMany({
      where: {
        ...analyticsScopeToCourseClassroomWhere(scope, periodId),
        classroomId: { in: classroomIds },
        modality: { name: { not: EClassModality.VIRTUAL_SPACE } },
      },
      select: {
        id: true,
        groupCode: true,
        studentCount: true,
        classroom: { select: { id: true, name: true } },
        course: { select: { code: true, name: true } },
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
    });
  }

  private inventoryRows(
    classrooms: AnalyticsClassroom[],
    boards: Board[],
    pcs: Pc[],
    airConditioners: AirConditioner[],
  ): TechnologyInventoryRow[] {
    const byId = new Map(
      classrooms.map((classroom) => [classroom.id, classroom]),
    );
    const mapItem = (
      item: Board | Pc | AirConditioner,
      type: TechnologyInventoryRow['equipmentTypeId'],
      label: string | null,
    ): TechnologyInventoryRow => {
      const classroom = byId.get(item.classroomId!)!;
      return {
        rowType: 'equipment_inventory',
        equipmentKey: `${type}:${item.id}`,
        equipmentId: item.id,
        equipmentTypeId: type,
        equipmentType: TYPE_LABELS[type],
        itemLabel: label,
        conditionId: item.condition.id,
        conditionLabel: item.condition.status,
        classroomId: classroom.id,
        classroomName: classroom.name,
        buildingId: classroom.building.id,
        buildingName: classroom.building.name,
        centerId: classroom.building.center.id,
        centerName: classroom.building.center.name,
      };
    };
    return [
      ...boards.map((item) =>
        mapItem(item, 'digital_blackboard', item.description),
      ),
      ...pcs.map((item) => mapItem(item, 'pc_equipment', item.inventoryNumber)),
      ...airConditioners.map((item) =>
        mapItem(item, 'air_conditioner', item.description),
      ),
    ];
  }

  private classroomRow(
    classroom: AnalyticsClassroom,
    digitalBlackboardCount: number,
  ): TechnologyClassroomRow {
    return {
      rowType: 'equipped_classroom',
      classroomId: classroom.id,
      classroomName: classroom.name,
      buildingId: classroom.building.id,
      buildingName: classroom.building.name,
      centerId: classroom.building.center.id,
      centerName: classroom.building.center.name,
      roomType: classroom.roomType.description,
      digitalBlackboardCount,
      equipped: digitalBlackboardCount > 0,
    };
  }

  private enrollmentRow(section: EquippedSection): TechnologyEnrollmentRow {
    const teacher = section.teachingSession.assignmentReport.teacher;
    return {
      rowType: 'equipped_classroom_enrollment',
      sectionId: section.id,
      courseCode: section.course.code,
      courseName: section.course.name,
      groupCode: section.groupCode,
      teacherId: teacher.id,
      teacherName: teacher.user.name,
      classroomId: section.classroom.id,
      classroomName: section.classroom.name,
      studentCount: section.studentCount,
      enrollmentStatus: section.studentCount === null ? 'missing' : 'known',
    };
  }

  private distribution(
    rows: TechnologyInventoryRow[],
    key: (row: TechnologyInventoryRow) => readonly [string, string],
  ) {
    const grouped = new Map<string, DistributionItem>();
    for (const row of rows) {
      const [id, label] = key(row);
      const current = grouped.get(id);
      if (current) current.value += 1;
      else grouped.set(id, { id, label, value: 1, percentage: 0 });
    }
    const denominator = rows.length;
    const items = [...grouped.values()]
      .map((item) => ({
        ...item,
        percentage: denominator ? (item.value / denominator) * 100 : 0,
      }))
      .sort(
        (left, right) =>
          left.label.localeCompare(right.label, 'es') ||
          left.id.localeCompare(right.id),
      );
    return {
      items,
      denominator,
      dataStatus: denominator ? 'complete' : 'not_applicable',
    };
  }

  private metric(
    key: string,
    value: number | null,
    unit: AnalyticsMetricResult['unit'],
    dataStatus: AnalyticsMetricResult['dataStatus'],
  ): AnalyticsMetricResult {
    return { key, value, unit, dataStatus, notes: TECHNOLOGY_NOTES };
  }

  private coverage(
    included: number,
    total: number,
    reasons: ['missing_enrollment'] | [],
  ) {
    return {
      included,
      total,
      excluded: total - included,
      reasons,
    } satisfies AnalyticsCoverage;
  }

  private validateSort(
    metric: TechnologyDetailMetric,
    sort: TechnologyExportDto['sort'],
  ) {
    if (!sort) return;
    const field = sort.split(':')[0];
    const allowed: Record<TechnologyDetailMetric, string[]> = {
      equipped_classrooms: [
        'classroomName',
        'buildingName',
        'digitalBlackboardCount',
        'equipped',
      ],
      equipped_classroom_enrollment: [
        'classroomName',
        'courseCode',
        'teacherName',
        'studentCount',
      ],
      equipment_inventory: [
        'classroomName',
        'buildingName',
        'equipmentType',
        'conditionLabel',
      ],
    };
    if (!allowed[metric].includes(field)) {
      throw new BadRequestException(
        `<sort> no es compatible con la métrica ${metric}.`,
      );
    }
  }

  private sortRows(
    rows: TechnologyDetailRow[],
    metric: TechnologyDetailMetric,
    sort: TechnologyExportDto['sort'],
  ) {
    const defaults: Record<TechnologyDetailMetric, string> = {
      equipped_classrooms: 'classroomName:asc',
      equipped_classroom_enrollment: 'courseCode:asc',
      equipment_inventory: 'equipmentType:asc',
    };
    const [field, order] = (sort ?? defaults[metric]).split(':');
    const direction = order === 'asc' ? 1 : -1;
    rows.sort((left, right) => {
      const leftValue = (left as unknown as Record<string, unknown>)[field];
      const rightValue = (right as unknown as Record<string, unknown>)[field];
      if (leftValue === null && rightValue !== null) return 1;
      if (leftValue !== null && rightValue === null) return -1;
      const compared =
        typeof leftValue === 'number' && typeof rightValue === 'number'
          ? leftValue - rightValue
          : typeof leftValue === 'boolean' && typeof rightValue === 'boolean'
            ? Number(leftValue) - Number(rightValue)
            : String(leftValue).localeCompare(String(rightValue), 'es');
      const tie =
        'equipmentKey' in left
          ? left.equipmentKey
          : 'sectionId' in left
            ? left.sectionId
            : left.classroomId;
      const rightTie =
        'equipmentKey' in right
          ? right.equipmentKey
          : 'sectionId' in right
            ? right.sectionId
            : right.classroomId;
      return compared * direction || tie.localeCompare(rightTie);
    });
  }

  private notesForMetric(
    metric: TechnologyDetailMetric,
  ): AnalyticsMetricNote[] {
    if (metric === 'equipment_inventory') {
      return ['current_classroom_catalog', 'current_inventory_catalog'];
    }
    if (metric === 'equipped_classrooms') {
      return ['current_classroom_catalog', 'potential_technology_coverage'];
    }
    return [
      'current_classroom_catalog',
      'potential_technology_coverage',
      'section_enrollments_not_unique_students',
    ];
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
