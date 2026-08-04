import { DigitalBlackboardUseStatus } from 'src/generated/prisma/client';

export type TScheduleComplianceCheck = {
  id: string;
  courseClassroomId: string;
  monitorId: string;
  buildingId: string;
  checkDate: Date;
  checkTime: string;
  isPresent: boolean;
  digitalBlackboardUseStatus: DigitalBlackboardUseStatus | null;
  observation?: string | null;
  offlineId?: string | null;
  syncedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TCreateScheduleComplianceCheck = Omit<
  TScheduleComplianceCheck,
  'id' | 'createdAt' | 'updatedAt' | 'syncedAt'
>;

export type TScheduleComplianceCheckDetail = TScheduleComplianceCheck & {
  monitor: {
    id: string;
    name: string;
  };
  courseClassroom: {
    id: string;
    section: string;
    days: string;
    course: {
      name: string;
      code: string;
    };
    classroom: {
      name: string;
      building: {
        id: string;
        name: string;
      };
    };
    teacher: {
      id: string;
      name: string;
    };
  };
};
