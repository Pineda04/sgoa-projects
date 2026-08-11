import { EPosition } from 'src/modules/teachers-config/enums';
import { StaffAnalyticsService } from '../staff-analytics.service';

describe('StaffAnalyticsService', () => {
  type StaffQuery = {
    where: {
      user: { activeStatus: boolean };
      positionHeld?: {
        none: { position: { name: { not: string } } };
      };
    };
    select: {
      positionHeld: {
        where: {
          startDate: { lte: Date };
          OR: ({ endDate: null } | { endDate: { gte: Date } })[];
        };
      };
    };
  };
  const teacherFindMany = jest.fn<Promise<object[]>, [StaffQuery]>();
  const prisma = {
    teacher: { findMany: teacherFindMany, findFirst: jest.fn() },
    centerDepartment: { findUnique: jest.fn() },
    contractType: { findUnique: jest.fn() },
    teacherCategory: { findUnique: jest.fn() },
    shift: { findUnique: jest.fn() },
    position: { findUnique: jest.fn() },
  };
  const scopeService = {
    getDomainScope: jest.fn().mockResolvedValue({
      domain: 'staff',
      branches: [{ type: 'global' }],
    }),
    intersectRequestedScope: jest.fn().mockReturnValue({
      domain: 'staff',
      branches: [{ type: 'global' }],
    }),
  };
  const source = (id: string, positions: { id: string; name: string }[]) => ({
    id,
    shiftStart: null,
    shiftEnd: null,
    user: { name: `Docente ${id}`, code: id },
    contractType: { id: 'contract', name: 'Contrato' },
    category: { id: 'category', name: 'Categoría' },
    shift: { id: 'shift', name: 'Jornada' },
    positionHeld: positions.map((position, index) => ({
      startDate: new Date('2026-01-01T00:00:00.000Z'),
      endDate: null,
      position,
      centerDepartment: {
        id: `center-${index}`,
        center: { name: 'Centro' },
        department: { name: `Departamento ${index}` },
      },
    })),
  });

  beforeEach(() => jest.clearAllMocks());

  it('keeps exclusive attributes reconciled and deduplicates multivalued positions', async () => {
    teacherFindMany.mockResolvedValue([
      source('1', [
        { id: 'position-1', name: 'Cargo 1' },
        { id: 'position-1', name: 'Cargo 1' },
        { id: 'position-2', name: 'Cargo 2' },
        { id: 'none', name: EPosition.NONE },
      ]),
      source('2', [{ id: 'none', name: EPosition.NONE }]),
    ]);
    const service = new StaffAnalyticsService(
      prisma as never,
      scopeService as never,
    );

    const result = await service.getSummary('user', {});

    expect(result.metrics.activeTeachers.value).toBe(2);
    expect(result.distributions.byContract).toEqual([
      expect.objectContaining({ value: 2, percentage: 100 }),
    ]);
    expect(result.distributions.byCurrentPosition).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'position-1', value: 1, percentage: 50 }),
        expect.objectContaining({ id: 'position-2', value: 1, percentage: 50 }),
        expect.objectContaining({
          id: 'no-current-position',
          value: 1,
          percentage: 50,
        }),
      ]),
    );
  });

  it('uses only active users and current appointment boundaries in the Prisma query', async () => {
    teacherFindMany.mockResolvedValue([]);
    const service = new StaffAnalyticsService(
      prisma as never,
      scopeService as never,
    );
    await service.getSummary('user', {});
    const query = teacherFindMany.mock.calls[0][0];
    expect(query.where.user).toEqual({ activeStatus: true });
    expect(query.select.positionHeld.where.startDate.lte).toBeInstanceOf(Date);
    expect(query.select.positionHeld.where.OR[0]).toEqual({ endDate: null });
    const endBoundary = query.select.positionHeld.where.OR[1];
    expect(endBoundary && 'endDate' in endBoundary).toBe(true);
    if (endBoundary && 'endDate' in endBoundary && endBoundary.endDate) {
      expect(endBoundary.endDate.gte).toBeInstanceOf(Date);
    }
  });

  it('uses the real NONE position id to filter teachers without a current real position', async () => {
    prisma.position.findUnique.mockResolvedValue({
      id: 'position-none',
      name: EPosition.NONE,
    });
    teacherFindMany.mockResolvedValue([]);
    const service = new StaffAnalyticsService(
      prisma as never,
      scopeService as never,
    );

    await service.getSummary('user', { positionId: 'position-none' });

    expect(prisma.position.findUnique).toHaveBeenCalledWith({
      where: { id: 'position-none' },
      select: { id: true, name: true },
    });
    const query = teacherFindMany.mock.calls[0][0];
    expect(query.where.positionHeld?.none.position).toEqual({
      name: { not: EPosition.NONE },
    });
  });
});
