export type TMonitorAssignmentCheckStatus = {
	id: string;
	monitorId: string;
	isPresent: boolean;
	checkTime: string;
	observation: string | null;
	createdAt: string;
	updatedAt: string;
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

export type TUpdateCheck = {
	id: string;
	isPresent?: boolean;
	observation?: string;
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

export type TMonitorBuilding = {
	id: string;
	name: string;
};

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

export type TCheckFilters = {
	dateFrom?: string;
	dateTo?: string;
	teacherId?: string;
	buildingId?: string;
	centerId?: string;
};

export enum EReportGroupBy {
	DAY = 'day',
	TEACHER = 'teacher',
	BUILDING = 'building',
}

export type TReportFilters = TCheckFilters & {
	groupBy?: EReportGroupBy;
};

export type TMonitorReportSummary = {
	totalChecks: number;
	present: number;
	absent: number;
	complianceRate: number;
};

export type TMonitorReportGroup = TMonitorReportSummary & {
	groupKey: string;
	groupLabel: string;
};

export type TMonitorReport = TMonitorReportSummary & {
	groups?: TMonitorReportGroup[];
};
