import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { EClassModality } from 'src/modules/course-classrooms/enums/modality.enum';
import { PrismaService } from 'src/prisma/prisma.service';
import { AnalyticsDomain, AnalyticsEffectiveScope } from '../types';
import { AnalyticsScopeService } from './analytics-scope.service';

export type AnalyticsClassroom = {
  id: string;
  name: string;
  maxCapacity: number | null;
  roomType: { id: string; description: string };
  building: {
    id: string;
    name: string;
    center: { id: string; name: string };
  };
};

@Injectable()
export class ClassroomAnalyticsUniverseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scopeService: AnalyticsScopeService,
  ) {}

  async load(
    userId: string,
    periodId: string,
    centerDepartmentId: string | undefined,
    domain: Extract<AnalyticsDomain, 'classrooms' | 'technology'>,
  ) {
    const domainScope = await this.scopeService.getDomainScope(userId, domain);
    const scope = this.scopeService.intersectRequestedScope(domainScope, {
      ...(centerDepartmentId
        ? { centerDepartmentIds: [centerDepartmentId] }
        : {}),
    });
    if (!scope.branches.length) {
      throw new ForbiddenException(
        domain === 'technology'
          ? 'El usuario no tiene alcance para analítica de tecnología.'
          : 'El usuario no tiene alcance para analítica de aulas.',
      );
    }

    const period = await this.prisma.academicPeriod.findUnique({
      where: { id: periodId },
      select: { id: true },
    });
    if (!period) throw new NotFoundException('El período académico no existe.');

    const centerDepartments = await this.loadCenterDepartments(scope);
    const classrooms = await this.prisma.classroom.findMany({
      where: {
        activeStatus: true,
        OR: this.classroomBranches(scope, centerDepartments, periodId),
      },
      select: {
        id: true,
        name: true,
        maxCapacity: true,
        roomType: { select: { id: true, description: true } },
        building: {
          select: {
            id: true,
            name: true,
            center: { select: { id: true, name: true } },
          },
        },
      },
    });

    return {
      scope,
      classrooms: classrooms.filter(
        ({ roomType }) => !this.isVirtualRoomType(roomType.description),
      ),
    };
  }

  private loadCenterDepartments(scope: AnalyticsEffectiveScope) {
    const ids = [
      ...new Set(
        scope.branches.flatMap((branch) =>
          branch.type !== 'teacher' && branch.centerDepartmentIds
            ? branch.centerDepartmentIds
            : [],
        ),
      ),
    ];
    return ids.length
      ? this.prisma.centerDepartment.findMany({
          where: { id: { in: ids } },
          select: { id: true, centerId: true, departmentId: true },
        })
      : Promise.resolve([]);
  }

  private classroomBranches(
    scope: AnalyticsEffectiveScope,
    centerDepartments: {
      id: string;
      centerId: string;
      departmentId: string;
    }[],
    periodId: string,
  ): Prisma.ClassroomWhereInput[] {
    const byId = new Map(centerDepartments.map((item) => [item.id, item]));
    return scope.branches.flatMap((branch): Prisma.ClassroomWhereInput[] => {
      if (branch.type === 'teacher') {
        return [
          {
            courseClassrooms: {
              some: {
                modality: { name: { not: EClassModality.VIRTUAL_SPACE } },
                teachingSession: {
                  assignmentReport: {
                    periodId,
                    teacherId: branch.teacherId,
                  },
                },
              },
            },
          },
        ];
      }
      if (!branch.centerDepartmentIds) return [{}];
      return branch.centerDepartmentIds.flatMap((id) => {
        const centerDepartment = byId.get(id);
        return centerDepartment
          ? [
              {
                building: { centerId: centerDepartment.centerId },
                classroomDepartments: {
                  some: { departmentId: centerDepartment.departmentId },
                },
              },
            ]
          : [];
      });
    });
  }

  private isVirtualRoomType(description: string) {
    return (
      description.normalize('NFKC').trim().toLocaleLowerCase('es') ===
      'espacio virtual'
    );
  }
}
