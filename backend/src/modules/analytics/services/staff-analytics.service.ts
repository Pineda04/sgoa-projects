import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EPosition } from 'src/modules/teachers-config/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { StaffDetailsDto, StaffExportDto, StaffFiltersDto } from '../dto';
import { AnalyticsEffectiveScope } from '../types';
import { AnalyticsScopeService } from './analytics-scope.service';

const NO_CURRENT_POSITION_ID = 'no-current-position';
const NONE_POSITION_NAME: string = EPosition.NONE;

type StaffSource = {
  id: string;
  shiftStart: Date | null;
  shiftEnd: Date | null;
  user: { name: string; code: string };
  contractType: { id: string; name: string };
  category: { id: string; name: string };
  shift: { id: string; name: string };
  positionHeld: {
    startDate: Date;
    endDate: Date | null;
    position: { id: string; name: string };
    centerDepartment: {
      id: string;
      center: { name: string };
      department: { name: string };
    };
  }[];
};

export type StaffDetailRow = {
  teacherId: string;
  name: string;
  code: string;
  contractType: { id: string; name: string };
  category: { id: string; name: string };
  shift: { id: string; name: string };
  shiftStart: Date | null;
  shiftEnd: Date | null;
  currentPositions: {
    position: { id: string; name: string };
    centerDepartment: {
      id: string;
      label: string;
      centerName: string;
      departmentName: string;
    };
    startDate: Date;
    endDate: Date | null;
  }[];
};

type DistributionItem = {
  id: string;
  label: string;
  value: number;
  percentage: number;
};

@Injectable()
export class StaffAnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scopeService: AnalyticsScopeService,
  ) {}

  async getSummary(userId: string, filters: StaffFiltersDto) {
    const { scope, positionIsNone } = await this.resolveAndValidate(
      userId,
      filters,
    );
    const teachers = await this.loadTeachers(scope, filters, positionIsNone);
    const total = teachers.length;

    return {
      asOf: new Date().toISOString(),
      notes: ['current_staff_attributes', 'current_position_catalog'] as const,
      metrics: {
        activeTeachers: {
          key: 'activeTeachers',
          value: total,
          unit: 'teachers',
          dataStatus: 'complete',
        },
      },
      distributions: {
        byContract: this.exclusiveDistribution(
          teachers,
          (teacher) => teacher.contractType,
        ),
        byCategory: this.exclusiveDistribution(
          teachers,
          (teacher) => teacher.category,
        ),
        byShift: this.exclusiveDistribution(
          teachers,
          (teacher) => teacher.shift,
        ),
        byCurrentPosition: this.positionDistribution(teachers),
      },
    };
  }

  async getDetails(userId: string, filters: StaffDetailsDto) {
    const page = Number(filters.page ?? '1');
    const size = Number(filters.size ?? '25');
    this.validatePagination(page, size);
    const rows = await this.buildRows(userId, filters);
    const start = (page - 1) * size;
    return {
      metric: filters.metric,
      asOf: new Date().toISOString(),
      notes: ['current_staff_attributes', 'current_position_catalog'] as const,
      rows: rows.slice(start, start + size),
      meta: { page, size, total: rows.length },
    };
  }

  getExportRows(
    userId: string,
    filters: StaffExportDto,
  ): Promise<StaffDetailRow[]> {
    return this.buildRows(userId, filters);
  }

  private async buildRows(userId: string, filters: StaffExportDto) {
    const { scope, positionIsNone } = await this.resolveAndValidate(
      userId,
      filters,
    );
    const teachers = await this.loadTeachers(scope, filters, positionIsNone);
    const rows = teachers.map(
      (teacher): StaffDetailRow => ({
        teacherId: teacher.id,
        name: teacher.user.name,
        code: teacher.user.code,
        contractType: teacher.contractType,
        category: teacher.category,
        shift: teacher.shift,
        shiftStart: teacher.shiftStart,
        shiftEnd: teacher.shiftEnd,
        currentPositions: teacher.positionHeld
          .filter(({ position }) => position.name !== NONE_POSITION_NAME)
          .map(({ position, centerDepartment, startDate, endDate }) => ({
            position,
            centerDepartment: {
              id: centerDepartment.id,
              label: `${centerDepartment.center.name} - ${centerDepartment.department.name}`,
              centerName: centerDepartment.center.name,
              departmentName: centerDepartment.department.name,
            },
            startDate,
            endDate,
          })),
      }),
    );
    const [field, order] = (filters.sort ?? 'name:asc').split(':') as [
      'name' | 'code' | 'contractName' | 'categoryName' | 'shiftName',
      'asc' | 'desc',
    ];
    const value = (row: StaffDetailRow) => {
      if (field === 'contractName') return row.contractType.name;
      if (field === 'categoryName') return row.category.name;
      if (field === 'shiftName') return row.shift.name;
      return row[field];
    };
    const direction = order === 'asc' ? 1 : -1;
    rows.sort(
      (left, right) =>
        value(left).localeCompare(value(right), 'es') * direction ||
        left.teacherId.localeCompare(right.teacherId),
    );
    return rows;
  }

  private async resolveAndValidate(userId: string, filters: StaffFiltersDto) {
    const domainScope = await this.scopeService.getDomainScope(userId, 'staff');
    const scope = this.scopeService.intersectRequestedScope(domainScope, {
      ...(filters.centerDepartmentId
        ? { centerDepartmentIds: [filters.centerDepartmentId] }
        : {}),
      ...(filters.teacherId ? { teacherId: filters.teacherId } : {}),
    });
    if (!scope.branches.length) {
      throw new ForbiddenException(
        'El usuario no tiene alcance para personal.',
      );
    }

    const [center, contractType, category, shift, position] = await Promise.all(
      [
        filters.centerDepartmentId
          ? this.prisma.centerDepartment.findUnique({
              where: { id: filters.centerDepartmentId },
              select: { id: true },
            })
          : null,
        filters.contractTypeId
          ? this.prisma.contractType.findUnique({
              where: { id: filters.contractTypeId },
              select: { id: true },
            })
          : null,
        filters.categoryId
          ? this.prisma.teacherCategory.findUnique({
              where: { id: filters.categoryId },
              select: { id: true },
            })
          : null,
        filters.shiftId
          ? this.prisma.shift.findUnique({
              where: { id: filters.shiftId },
              select: { id: true },
            })
          : null,
        filters.positionId
          ? this.prisma.position.findUnique({
              where: { id: filters.positionId },
              select: { id: true, name: true },
            })
          : null,
      ],
    );
    if (
      (filters.centerDepartmentId && !center) ||
      (filters.contractTypeId && !contractType) ||
      (filters.categoryId && !category) ||
      (filters.shiftId && !shift) ||
      (filters.positionId && !position)
    ) {
      throw new NotFoundException('Uno o más filtros de personal no existen.');
    }

    if (filters.teacherId) {
      const authorized = await this.prisma.teacher.findFirst({
        where: {
          id: filters.teacherId,
          user: { activeStatus: true },
          ...this.staffScopeWhere(scope, new Date()),
        },
        select: { id: true },
      });
      if (!authorized) {
        throw new ForbiddenException(
          'El docente solicitado está fuera del alcance de Analytics.',
        );
      }
    }
    return { scope, positionIsNone: position?.name === EPosition.NONE };
  }

  private loadTeachers(
    scope: AnalyticsEffectiveScope,
    filters: StaffFiltersDto,
    positionIsNone: boolean,
  ): Promise<StaffSource[]> {
    const now = new Date();
    const currentPositionWhere = {
      startDate: { lte: now },
      OR: [{ endDate: null }, { endDate: { gte: now } }],
      ...this.positionScopeWhere(scope),
    };
    return this.prisma.teacher.findMany({
      where: {
        user: { activeStatus: true },
        ...this.staffScopeWhere(scope, now),
        ...(filters.teacherId ? { id: filters.teacherId } : {}),
        ...(filters.contractTypeId
          ? { contractTypeId: filters.contractTypeId }
          : {}),
        ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
        ...(filters.shiftId ? { shiftId: filters.shiftId } : {}),
        ...(filters.positionId
          ? positionIsNone
            ? {
                positionHeld: {
                  none: {
                    ...currentPositionWhere,
                    position: { name: { not: EPosition.NONE } },
                  },
                },
              }
            : {
                positionHeld: {
                  some: {
                    ...currentPositionWhere,
                    positionId: filters.positionId,
                    position: { name: { not: EPosition.NONE } },
                  },
                },
              }
          : {}),
      },
      select: {
        id: true,
        shiftStart: true,
        shiftEnd: true,
        user: { select: { name: true, code: true } },
        contractType: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        shift: { select: { id: true, name: true } },
        positionHeld: {
          where: currentPositionWhere,
          select: {
            startDate: true,
            endDate: true,
            position: { select: { id: true, name: true } },
            centerDepartment: {
              select: {
                id: true,
                center: { select: { name: true } },
                department: { select: { name: true } },
              },
            },
          },
          orderBy: [{ position: { name: 'asc' } }, { id: 'asc' }],
        },
      },
    });
  }

  private staffScopeWhere(scope: AnalyticsEffectiveScope, now: Date) {
    const global = scope.branches.find(({ type }) => type === 'global');
    if (global?.type === 'global') {
      return global.centerDepartmentIds
        ? {
            positionHeld: {
              some: {
                centerDepartmentId: { in: global.centerDepartmentIds },
                startDate: { lte: now },
                OR: [{ endDate: null }, { endDate: { gte: now } }],
              },
            },
          }
        : {};
    }
    return {
      OR: scope.branches.map((branch) =>
        branch.type === 'teacher'
          ? { id: branch.teacherId }
          : {
              ...(branch.teacherId ? { id: branch.teacherId } : {}),
              positionHeld: {
                some: {
                  centerDepartmentId: { in: branch.centerDepartmentIds },
                  startDate: { lte: now },
                  OR: [{ endDate: null }, { endDate: { gte: now } }],
                },
              },
            },
      ),
    };
  }

  private positionScopeWhere(scope: AnalyticsEffectiveScope) {
    const global = scope.branches.find(({ type }) => type === 'global');
    if (global?.type === 'global') {
      return global.centerDepartmentIds
        ? { centerDepartmentId: { in: global.centerDepartmentIds } }
        : {};
    }
    const ids = scope.branches.flatMap((branch) =>
      branch.type === 'centerDepartments' ? branch.centerDepartmentIds : [],
    );
    return ids.length ? { centerDepartmentId: { in: [...new Set(ids)] } } : {};
  }

  private exclusiveDistribution(
    teachers: StaffSource[],
    select: (teacher: StaffSource) => { id: string; name: string },
  ): DistributionItem[] {
    const values = new Map<string, { label: string; value: number }>();
    for (const teacher of teachers) {
      const item = select(teacher);
      const current = values.get(item.id);
      values.set(item.id, {
        label: item.name,
        value: (current?.value ?? 0) + 1,
      });
    }
    return this.toDistribution(values, teachers.length);
  }

  private positionDistribution(teachers: StaffSource[]): DistributionItem[] {
    const values = new Map<string, { label: string; value: number }>();
    for (const teacher of teachers) {
      const positions = new Map(
        teacher.positionHeld
          .filter(({ position }) => position.name !== NONE_POSITION_NAME)
          .map(({ position }) => [position.id, position]),
      );
      if (!positions.size) {
        const current = values.get(NO_CURRENT_POSITION_ID);
        values.set(NO_CURRENT_POSITION_ID, {
          label: 'Sin cargo académico vigente',
          value: (current?.value ?? 0) + 1,
        });
      }
      for (const position of positions.values()) {
        const current = values.get(position.id);
        values.set(position.id, {
          label: position.name,
          value: (current?.value ?? 0) + 1,
        });
      }
    }
    return this.toDistribution(values, teachers.length);
  }

  private toDistribution(
    values: Map<string, { label: string; value: number }>,
    denominator: number,
  ): DistributionItem[] {
    return [...values.entries()]
      .map(([id, item]) => ({
        id,
        ...item,
        percentage: denominator ? (item.value / denominator) * 100 : 0,
      }))
      .sort(
        (left, right) =>
          left.label.localeCompare(right.label, 'es') ||
          left.id.localeCompare(right.id),
      );
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
