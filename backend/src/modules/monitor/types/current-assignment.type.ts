import { DigitalBlackboardUseStatus } from 'src/generated/prisma/client';

export type TMonitorAssignmentCheckStatus = {
  id: string;
  monitorId: string;
  isPresent: boolean;
  checkTime: string;
  observation: string | null;
  digitalBlackboardUseStatus: DigitalBlackboardUseStatus | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TMonitorCurrentAssignment = {
  courseClassroomId: string;
  courseName: string;
  courseCode: string;
  groupCode: string;
  section: string;
  days: string;
  hasDigitalBlackboard: boolean;
  teacher: {
    id: string;
    name: string;
  };
  check: TMonitorAssignmentCheckStatus | null;
};

export type TMonitorClassroomAssignments = {
  classroomId: string;
  classroomName: string;
  assignments: TMonitorCurrentAssignment[];
};

export type TMonitorBuildingAssignments = {
  buildingId: string;
  buildingName: string;
  classrooms: TMonitorClassroomAssignments[];
};
