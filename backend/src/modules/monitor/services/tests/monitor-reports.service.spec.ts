import { EReportGroupBy } from '../../enums';
import { MonitorReportsService } from '../monitor-reports.service';

describe('MonitorReportsService', () => {
  const prisma = {
    scheduleComplianceCheck: { findMany: jest.fn() },
  };
  const access = { resolveReadScope: jest.fn() };
  const service = new MonitorReportsService(prisma as never, access as never);

  beforeEach(() => {
    jest.clearAllMocks();
    access.resolveReadScope.mockResolvedValue({ type: 'global' });
  });

  it('returns null compliance when there are no checks', async () => {
    prisma.scheduleComplianceCheck.findMany.mockResolvedValue([]);

    await expect(service.getReport('admin-1', {})).resolves.toEqual({
      totalChecks: 0,
      present: 0,
      absent: 0,
      complianceRate: null,
    });
  });

  it('groups checks by center and calculates compliance', async () => {
    const base = {
      checkDate: new Date('2026-08-03T06:00:00.000Z'),
      building: {
        id: 'building-1',
        name: 'Edificio 1',
        center: { id: 'center-1', name: 'Centro 1' },
      },
      courseClassroom: {
        classroom: {
          building: {
            id: 'building-1',
            name: 'Edificio 1',
            center: { id: 'center-1', name: 'Centro 1' },
          },
        },
        teachingSession: {
          assignmentReport: {
            teacher: { id: 'teacher-1', user: { name: 'Docente' } },
            centerDepartment: {
              id: 'department-1',
              center: { name: 'Centro 1' },
              department: { name: 'Carrera 1' },
            },
            period: {
              id: 'period-1',
              year: 2026,
              pac: 2,
              pac_modality: 'Trimestre',
            },
          },
        },
      },
    };
    prisma.scheduleComplianceCheck.findMany.mockResolvedValue([
      { ...base, isPresent: true },
      { ...base, isPresent: false },
    ]);

    const result = await service.getReport('admin-1', {
      groupBy: EReportGroupBy.CENTER,
    });

    expect(result.complianceRate).toBe(50);
    expect(result.groups).toEqual([
      {
        groupKey: 'center-1',
        groupLabel: 'Centro 1',
        totalChecks: 2,
        present: 1,
        absent: 1,
        complianceRate: 50,
      },
    ]);
  });
});
