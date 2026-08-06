import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { DigitalBlackboardUseStatus } from 'src/generated/prisma/client';
import { MonitorChecksService } from '../monitor-checks.service';

const BASE_DTO = {
  courseClassroomId: '11111111-1111-4111-8111-111111111111',
  checkDate: '2026-08-03',
  checkTime: '10:30',
  isPresent: true,
};

const scheduledCourseClassroom = (
  digitalBlackboards: { id: string }[] = [],
) => ({
  id: BASE_DTO.courseClassroomId,
  days: 'Lu',
  section: '10:00 - 11:00',
  classroom: { buildingId: 'building-1', digitalBlackboards },
  teachingSession: {
    assignmentReport: {
      period: {
        startDate: new Date('2026-08-01T06:00:00.000Z'),
        endDate: new Date('2026-08-31T06:00:00.000Z'),
      },
    },
  },
});

describe('MonitorChecksService', () => {
  const prisma = {
    courseClassroom: { findUnique: jest.fn(), findMany: jest.fn() },
    scheduleComplianceCheck: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };
  const access = {
    getAssignedBuildingIdsForCapture: jest.fn(),
    resolveReadScope: jest.fn(),
  };
  const service = new MonitorChecksService(prisma as never, access as never);

  beforeEach(() => {
    jest.clearAllMocks();
    access.getAssignedBuildingIdsForCapture.mockResolvedValue(['building-1']);
    prisma.scheduleComplianceCheck.findUnique.mockResolvedValue(null);
    prisma.scheduleComplianceCheck.findFirst.mockResolvedValue(null);
  });

  it('rejects a section outside the assigned buildings', async () => {
    prisma.courseClassroom.findUnique.mockResolvedValue({
      id: BASE_DTO.courseClassroomId,
      classroom: { buildingId: 'building-2', digitalBlackboards: [] },
    });

    await expect(service.create('monitor-1', BASE_DTO)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('requires a blackboard status for presence in an equipped classroom', async () => {
    prisma.courseClassroom.findUnique.mockResolvedValue(
      scheduledCourseClassroom([{ id: 'board-1' }]),
    );

    await expect(service.create('monitor-1', BASE_DTO)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('stores observed use and marks queued checks as synchronized', async () => {
    const offlineId = '22222222-2222-4222-8222-222222222222';
    prisma.courseClassroom.findUnique.mockResolvedValue(
      scheduledCourseClassroom([{ id: 'board-1' }]),
    );
    prisma.scheduleComplianceCheck.create.mockImplementation(({ data }) =>
      Promise.resolve({
        id: 'check-1',
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    const result = await service.create('monitor-1', {
      ...BASE_DTO,
      offlineId,
      digitalBlackboardUseStatus: DigitalBlackboardUseStatus.USED,
    });

    expect(result.digitalBlackboardUseStatus).toBe(
      DigitalBlackboardUseStatus.USED,
    );
    expect(result.syncedAt).toBeInstanceOf(Date);
  });

  it('returns an identical offline replay and rejects conflicting content', async () => {
    const offlineId = '22222222-2222-4222-8222-222222222222';
    const replay = {
      id: 'check-1',
      courseClassroomId: BASE_DTO.courseClassroomId,
      monitorId: 'monitor-1',
      buildingId: 'building-1',
      checkDate: new Date('2026-08-03T06:00:00.000Z'),
      checkTime: BASE_DTO.checkTime,
      isPresent: false,
      observation: null,
      digitalBlackboardUseStatus: null,
      offlineId,
      syncedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    prisma.courseClassroom.findUnique.mockResolvedValue(
      scheduledCourseClassroom(),
    );
    prisma.scheduleComplianceCheck.findUnique.mockResolvedValue(replay);

    await expect(
      service.create('monitor-1', {
        ...BASE_DTO,
        isPresent: false,
        offlineId,
      }),
    ).resolves.toEqual(replay);
    await expect(
      service.create('monitor-1', {
        ...BASE_DTO,
        isPresent: false,
        observation: 'changed',
        offlineId,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects checks outside the scheduled day and time', async () => {
    prisma.courseClassroom.findUnique.mockResolvedValue(
      scheduledCourseClassroom(),
    );

    await expect(
      service.create('monitor-1', {
        ...BASE_DTO,
        checkDate: '2026-08-04',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.create('monitor-1', {
        ...BASE_DTO,
        checkTime: '11:01',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a second check for the same section and date', async () => {
    prisma.courseClassroom.findUnique.mockResolvedValue(
      scheduledCourseClassroom(),
    );
    prisma.scheduleComplianceCheck.findFirst.mockResolvedValue({
      id: 'existing-check',
    });

    await expect(service.create('monitor-1', BASE_DTO)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  describe('update', () => {
    const existingCheck = (
      digitalBlackboardUseStatus: DigitalBlackboardUseStatus | null,
    ) => ({
      id: 'check-1',
      monitorId: 'monitor-1',
      buildingId: 'building-1',
      isPresent: true,
      digitalBlackboardUseStatus,
      courseClassroom: {
        classroom: { digitalBlackboards: [{ id: 'board-1' }] },
      },
    });

    it('updates the observed blackboard status in an equipped classroom', async () => {
      prisma.scheduleComplianceCheck.findUnique.mockResolvedValue(
        existingCheck(DigitalBlackboardUseStatus.USED),
      );
      prisma.scheduleComplianceCheck.update.mockResolvedValue({
        id: 'check-1',
      });

      await service.update('monitor-1', 'check-1', {
        isPresent: true,
        digitalBlackboardUseStatus: DigitalBlackboardUseStatus.NOT_USED,
      });

      expect(prisma.scheduleComplianceCheck.update).toHaveBeenCalledWith({
        where: { id: 'check-1' },
        data: {
          isPresent: true,
          digitalBlackboardUseStatus: DigitalBlackboardUseStatus.NOT_USED,
        },
      });
    });

    it('clears blackboard use when an absence is registered', async () => {
      prisma.scheduleComplianceCheck.findUnique.mockResolvedValue(
        existingCheck(DigitalBlackboardUseStatus.USED),
      );
      prisma.scheduleComplianceCheck.update.mockResolvedValue({
        id: 'check-1',
      });

      await service.update('monitor-1', 'check-1', { isPresent: false });

      expect(prisma.scheduleComplianceCheck.update).toHaveBeenCalledWith({
        where: { id: 'check-1' },
        data: { isPresent: false, digitalBlackboardUseStatus: null },
      });
    });

    it('requires blackboard use when changing an equipped check to present', async () => {
      prisma.scheduleComplianceCheck.findUnique.mockResolvedValue({
        ...existingCheck(null),
        isPresent: false,
      });

      await expect(
        service.update('monitor-1', 'check-1', { isPresent: true }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('batchSync', () => {
    const monitorId = '11111111-1111-4111-8111-111111111111';
    const check = (offlineId: string) => ({
      offlineId,
      courseClassroomId: BASE_DTO.courseClassroomId,
      checkDate: BASE_DTO.checkDate,
      checkTime: BASE_DTO.checkTime,
      isPresent: true,
    });

    it('rejects checks whose classroom no longer exists', async () => {
      prisma.courseClassroom.findMany.mockResolvedValue([]);

      await expect(
        service.batchSync(monitorId, { checks: [check('missing')] }),
      ).resolves.toEqual({
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
      prisma.courseClassroom.findMany.mockResolvedValue([
        scheduledCourseClassroom(),
      ]);
      prisma.$queryRaw.mockResolvedValue([]);

      await expect(
        service.batchSync(monitorId, { checks: [check('conflict')] }),
      ).resolves.toMatchObject({
        synced: 0,
        conflicts: 1,
        conflictIds: ['conflict'],
      });
    });

    it('processes every valid check and keeps individual successful ids', async () => {
      const checks = Array.from({ length: 26 }, (_, index) =>
        check(`id-${index}`),
      );
      prisma.courseClassroom.findMany.mockResolvedValue([
        scheduledCourseClassroom(),
      ]);
      prisma.$queryRaw.mockResolvedValue([{ monitorId }]);

      const result = await service.batchSync(monitorId, { checks });

      expect(prisma.$queryRaw).toHaveBeenCalledTimes(26);
      expect(result.synced).toBe(26);
      expect(result.conflictIds).toEqual([]);
    });

    it('rejects batch checks outside the monitor building scope', async () => {
      prisma.courseClassroom.findMany.mockResolvedValue([
        {
          ...scheduledCourseClassroom(),
          classroom: { buildingId: 'building-2', digitalBlackboards: [] },
        },
      ]);

      await expect(
        service.batchSync(monitorId, { checks: [check('outside-scope')] }),
      ).resolves.toMatchObject({
        synced: 0,
        rejected: 1,
        rejectedIds: ['outside-scope'],
      });
      expect(prisma.$queryRaw).not.toHaveBeenCalled();
    });
  });
});
