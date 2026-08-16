import { MonitorAssignmentsService } from '../monitor-assignments.service';

type TFindManyArgs = {
  where?: unknown;
  include?: unknown;
  select?: unknown;
  orderBy?: unknown;
};

type TWhere = {
  classroom?: { buildingId?: { in: string[] } };
};

describe('MonitorAssignmentsService', () => {
  const courseClassroomFindMany = jest.fn<Promise<never[]>, [TFindManyArgs]>();
  const buildingFindMany = jest.fn<Promise<never[]>, [TFindManyArgs]>();
  const prisma = {
    courseClassroom: { findMany: courseClassroomFindMany },
    building: { findMany: buildingFindMany },
  };
  const periods = { currentAcademicPeriod: jest.fn() };
  const access = { getAssignedBuildingIdsForCapture: jest.fn() };
  const service = new MonitorAssignmentsService(
    prisma as never,
    periods as never,
    access as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    periods.currentAcademicPeriod.mockResolvedValue({ id: 'period-1' });
    courseClassroomFindMany.mockResolvedValue([]);
    buildingFindMany.mockResolvedValue([]);
  });

  it('omits the building scope when the monitor has no building assignments', async () => {
    access.getAssignedBuildingIdsForCapture.mockResolvedValue([]);

    await service.findCurrentAssignments('monitor-1');

    const where = courseClassroomFindMany.mock.calls[0][0].where as
      | TWhere
      | undefined;
    expect(where?.classroom?.buildingId).toBeUndefined();
  });

  it('filters by the assigned buildings when the monitor has a scope', async () => {
    access.getAssignedBuildingIdsForCapture.mockResolvedValue([
      'building-1',
      'building-2',
    ]);

    await service.findCurrentAssignments('monitor-1');

    const where = courseClassroomFindMany.mock.calls[0][0].where as
      | TWhere
      | undefined;
    expect(where?.classroom?.buildingId).toEqual({
      in: ['building-1', 'building-2'],
    });
  });

  it('returns all buildings when the monitor has no building assignments', async () => {
    access.getAssignedBuildingIdsForCapture.mockResolvedValue([]);

    await service.findBuildings('monitor-1');

    expect(buildingFindMany).toHaveBeenCalledWith({
      where: undefined,
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  });

  it('returns only the assigned buildings when the monitor has a scope', async () => {
    access.getAssignedBuildingIdsForCapture.mockResolvedValue(['building-1']);

    await service.findBuildings('monitor-1');

    expect(buildingFindMany).toHaveBeenCalledWith({
      where: { id: { in: ['building-1'] } },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  });
});
