import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { MonitorChecksService } from '../monitor-checks.service';

const monitorId = '11111111-1111-1111-1111-111111111111';
const classroomId = '22222222-2222-2222-2222-222222222222';

describe('MonitorChecksService.batchSync', () => {
  let service: MonitorChecksService;
  const prisma = {
    courseClassroom: { findMany: jest.fn() },
    $queryRaw: jest.fn(),
  };

  const check = (offlineId: string) => ({
    offlineId,
    courseClassroomId: classroomId,
    checkDate: '2026-08-03',
    checkTime: '10:00',
    isPresent: true,
  });

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonitorChecksService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(MonitorChecksService);
  });

  it('rejects checks whose classroom no longer exists', async () => {
    prisma.courseClassroom.findMany.mockResolvedValue([]);

    await expect(service.batchSync(monitorId, { checks: [check('missing')] }))
      .resolves.toEqual({
        synced: 0,
        conflicts: 0,
        skipped: 0,
        rejected: 1,
        conflictIds: [],
        skippedIds: [],
        rejectedIds: ['missing'],
      });
    expect(prisma.$queryRaw).not.toHaveBeenCalled();
  });

  it('reports an atomic ownership conflict without deleting the local id', async () => {
    prisma.courseClassroom.findMany.mockResolvedValue([{ id: classroomId }]);
    prisma.$queryRaw.mockResolvedValue([]);

    await expect(service.batchSync(monitorId, { checks: [check('conflict')] }))
      .resolves.toMatchObject({
        synced: 0,
        conflicts: 1,
        conflictIds: ['conflict'],
      });
  });

  it('processes every check and keeps individual successful ids', async () => {
    const checks = Array.from({ length: 26 }, (_, index) => check(`id-${index}`));
    prisma.courseClassroom.findMany.mockResolvedValue([{ id: classroomId }]);
    prisma.$queryRaw.mockResolvedValue([{ monitorId }]);

    const result = await service.batchSync(monitorId, { checks });

    expect(prisma.$queryRaw).toHaveBeenCalledTimes(26);
    expect(result.synced).toBe(26);
    expect(result.conflictIds).toEqual([]);
  });
});
