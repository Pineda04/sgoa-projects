export type TMonitorAssignmentCheckStatus = {
	id: string;
	isPresent: boolean;
	checkTime: string;
	observation: string | null;
};

export type TMonitorCurrentAssignment = {
	courseClassroomId: string;
	courseName: string;
	courseCode: string;
	groupCode: string;
	section: string;
	days: string;
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

export type TCreateCheck = {
	courseClassroomId: string;
	checkDate: string;
	checkTime: string;
	isPresent: boolean;
	observation?: string;
	offlineId?: string;
};

export type TScheduleComplianceCheck = {
	id: string;
	courseClassroomId: string;
	monitorId: string;
	checkDate: string;
	checkTime: string;
	isPresent: boolean;
	observation?: string | null;
	offlineId?: string | null;
	syncedAt?: string | null;
	createdAt: string;
	updatedAt: string;
};
