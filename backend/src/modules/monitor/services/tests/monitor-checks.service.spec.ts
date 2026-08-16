import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DigitalBlackboardUseStatus } from 'src/generated/prisma/client';
import { MonitorChecksService } from '../monitor-checks.service';

const BASE_DTO = {
  courseClassroomId: '11111111-1111-4111-8111-111111111111',
  checkDate: '2026-08-03',
  checkTime: '10:30',
  isPresent: true,
};

const courseClassroomFixture = (buildingId = 'building-1') => ({
  id: BASE_DTO.courseClassroomId,
  classroom: { buildingId },
});

const existingCheck = (
  digitalBlackboardUseStatus: DigitalBlackboardUseStatus | null = null,
  monitorId = 'monitor-1',
) => ({
  id: 'check-1',
  monitorId,
  buildingId: 'building-1',
  isPresent: true,
  digitalBlackboardUseStatus,
  checkDate: new Date('2026-08-03T06:00:00.000Z'),
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
    prisma.scheduleComplianceCheck.findUnique.mockResolvedValue(null);
    prisma.scheduleComplianceCheck.findFirst.mockResolvedValue(null);
  });

  describe('create', () => {
    it('rejects a courseClassroom that does not exist', async () => {
      prisma.courseClassroom.findUnique.mockResolvedValue(null);

      await expect(
        service.create('monitor-1', BASE_DTO),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it.each(['10:00 - 11:00', '10:00', '4:00 PM', 'SEC-01'])(
      'accepts a check for any section format %s at any time',
      async () => {
        prisma.courseClassroom.findUnique.mockResolvedValue(
          courseClassroomFixture(),
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
          checkTime: '22:00',
        });

        expect(result).toMatchObject({
          buildingId: 'building-1',
          checkTime: '22:00',
        });
      },
    );

    it('stores observed use and marks queued checks as synchronized', async () => {
      const offlineId = '22222222-2222-4222-8222-222222222222';
      prisma.courseClassroom.findUnique.mockResolvedValue(
        courseClassroomFixture(),
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
        courseClassroomFixture(),
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

    it('rejects a second check for the same section and date', async () => {
      prisma.courseClassroom.findUnique.mockResolvedValue(
        courseClassroomFixture(),
      );
      prisma.scheduleComplianceCheck.findFirst.mockResolvedValue({
        id: 'existing-check',
      });

      await expect(
        service.create('monitor-1', BASE_DTO),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('update', () => {
    it('rejects editing a check owned by another monitor', async () => {
      prisma.scheduleComplianceCheck.findUnique.mockResolvedValue(
        existingCheck(null, 'other-monitor'),
      );

      await expect(
        service.update('monitor-1', 'check-1', { isPresent: false }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('updates presence and clears blackboard use when an absence is registered', async () => {
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

    it('preserves blackboard use when presence is kept without a new status', async () => {
      prisma.scheduleComplianceCheck.findUnique.mockResolvedValue(
        existingCheck(DigitalBlackboardUseStatus.USED),
      );
      prisma.scheduleComplianceCheck.update.mockResolvedValue({
        id: 'check-1',
      });

      await service.update('monitor-1', 'check-1', { isPresent: true });

      expect(prisma.scheduleComplianceCheck.update).toHaveBeenCalledWith({
        where: { id: 'check-1' },
        data: {
          isPresent: true,
          digitalBlackboardUseStatus: DigitalBlackboardUseStatus.USED,
        },
      });
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
        courseClassroomFixture(),
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
        courseClassroomFixture(),
      ]);
      prisma.$queryRaw.mockResolvedValue([{ monitorId }]);

      const result = await service.batchSync(monitorId, { checks });

      expect(prisma.$queryRaw).toHaveBeenCalledTimes(26);
      expect(result.synced).toBe(26);
      expect(result.conflictIds).toEqual([]);
    });

    it('syncs checks regardless of the section format', async () => {
      prisma.courseClassroom.findMany.mockResolvedValue([
        courseClassroomFixture(),
      ]);
      prisma.$queryRaw.mockResolvedValue([{ monitorId }]);

      const result = await service.batchSync(monitorId, {
        checks: [check('legacy')],
      });

      expect(result).toMatchObject({ synced: 1, rejected: 0 });
    });
  });
});
