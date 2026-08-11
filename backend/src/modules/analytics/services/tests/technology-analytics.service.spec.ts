import { BadRequestException } from '@nestjs/common';
import { EClassModality } from 'src/modules/course-classrooms/enums/modality.enum';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClassroomAnalyticsUniverseService } from '../classroom-analytics-universe.service';
import { TechnologyAnalyticsService } from '../technology-analytics.service';

const room = (id: string, buildingId = 'building-1') => ({
  id,
  name: `Aula ${id}`,
  maxCapacity: 30,
  roomType: { id: 'type-1', description: 'Aula' },
  building: {
    id: buildingId,
    name: `Edificio ${buildingId}`,
    center: { id: 'center-1', name: 'Centro 1' },
  },
});
const condition = { id: 'condition-1', status: 'Bueno' };
const section = (id: string, studentCount: number | null) => ({
  id,
  groupCode: 'G1',
  studentCount,
  classroom: { id: 'room-1', name: 'Aula room-1' },
  course: { code: `CODE-${id}`, name: `Curso ${id}` },
  teachingSession: {
    assignmentReport: {
      teacher: { id: 'teacher-1', user: { name: 'Docente 1' } },
    },
  },
});

describe('TechnologyAnalyticsService', () => {
  const prisma = {
    digitalBlackboard: { findMany: jest.fn() },
    pcEquipment: { findMany: jest.fn() },
    airConditioner: { findMany: jest.fn() },
    courseClassroom: { findMany: jest.fn() },
  };
  const universe = { load: jest.fn() };
  const scope = {
    domain: 'technology' as const,
    branches: [
      { type: 'centerDepartments' as const, centerDepartmentIds: ['cd-1'] },
    ],
  };
  const service = new TechnologyAnalyticsService(
    prisma as unknown as PrismaService,
    universe as unknown as ClassroomAnalyticsUniverseService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    universe.load.mockResolvedValue({
      scope,
      classrooms: [room('room-1'), room('room-2')],
    });
    prisma.digitalBlackboard.findMany.mockResolvedValue([
      {
        id: 'board-1',
        description: '=board',
        classroomId: 'room-1',
        condition,
      },
      { id: 'board-2', description: null, classroomId: 'room-1', condition },
    ]);
    prisma.pcEquipment.findMany.mockResolvedValue([
      { id: 'pc-1', inventoryNumber: 'PC-1', classroomId: 'room-2', condition },
    ]);
    prisma.airConditioner.findMany.mockResolvedValue([
      { id: 'ac-1', description: 'AC', classroomId: 'room-1', condition },
    ]);
    prisma.courseClassroom.findMany.mockResolvedValue([
      section('section-1', 0),
      section('section-1', 0),
      section('section-2', null),
    ]);
  });

  it('reconciles distinct equipped rooms, deduplicated sections and all inventory distributions', async () => {
    const result = await service.getSummary('coordinator', {
      periodId: 'period-1',
      centerDepartmentId: 'cd-1',
    });

    expect(result.metrics.eligibleClassrooms.value).toBe(2);
    expect(result.metrics.equippedClassrooms.value).toBe(1);
    expect(result.metrics.digitalBlackboardCoverage).toEqual(
      expect.objectContaining({ value: 50, numerator: 1, denominator: 2 }),
    );
    expect(result.metrics.knownEnrollmentsInEquippedClassrooms).toEqual(
      expect.objectContaining({ value: 0, dataStatus: 'partial' }),
    );
    expect(result.metrics.equippedEnrollmentDataCoverage.value).toBe(50);
    expect(result.metrics.totalEquipment.value).toBe(4);
    for (const distribution of Object.values(result.distributions)) {
      expect(distribution.denominator).toBe(4);
      expect(
        distribution.items.reduce((sum, item) => sum + item.value, 0),
      ).toBe(4);
    }
    expect(prisma.courseClassroom.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            {
              teachingSession: {
                assignmentReport: {
                  periodId: 'period-1',
                  centerDepartmentId: { in: ['cd-1'] },
                },
              },
            },
          ],
          classroomId: { in: ['room-1'] },
          modality: { name: { not: EClassModality.VIRTUAL_SPACE } },
        },
      }),
    );
  });

  it('returns not-applicable coverage and reconciled empty distributions for no eligible rooms', async () => {
    universe.load.mockResolvedValue({ scope, classrooms: [] });
    const result = await service.getSummary('admin', { periodId: 'period-1' });
    expect(result.metrics.digitalBlackboardCoverage).toEqual(
      expect.objectContaining({ value: null, dataStatus: 'not_applicable' }),
    );
    expect(result.metrics.knownEnrollmentsInEquippedClassrooms.value).toBe(0);
    expect(result.metrics.equippedEnrollmentDataCoverage.dataStatus).toBe(
      'not_applicable',
    );
    expect(result.distributions.equipmentByType).toEqual({
      items: [],
      denominator: 0,
      dataStatus: 'not_applicable',
    });
    expect(prisma.digitalBlackboard.findMany).not.toHaveBeenCalled();
  });

  it('uses metric-specific queries, all eligible classroom rows, and stable equipment keys', async () => {
    const classrooms = await service.getDetails('admin', {
      periodId: 'period-1',
      metric: 'equipped_classrooms',
    });
    expect(classrooms.rows).toHaveLength(2);
    expect(classrooms.rows[0]).toEqual(
      expect.objectContaining({ digitalBlackboardCount: 2, equipped: true }),
    );
    expect(prisma.pcEquipment.findMany).not.toHaveBeenCalled();
    expect(prisma.courseClassroom.findMany).not.toHaveBeenCalled();

    const inventory = await service.getExportRows('admin', {
      periodId: 'period-1',
      metric: 'equipment_inventory',
    });
    expect(
      inventory.map((row) => 'equipmentKey' in row && row.equipmentKey),
    ).toEqual(
      expect.arrayContaining([
        'digital_blackboard:board-1',
        'digital_blackboard:board-2',
        'pc_equipment:pc-1',
        'air_conditioner:ac-1',
      ]),
    );
    expect(prisma.courseClassroom.findMany).not.toHaveBeenCalled();
  });

  it('rejects incompatible sorts and invalid pagination', async () => {
    await expect(
      service.getDetails('admin', {
        periodId: 'period-1',
        metric: 'equipment_inventory',
        sort: 'studentCount:asc',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.getDetails('admin', {
        periodId: 'period-1',
        metric: 'equipped_classrooms',
        page: '0',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
