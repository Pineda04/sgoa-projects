export type DigitalBlackboardUseStatus = 'USED' | 'NOT_USED' | 'UNKNOWN';

export type TMonitorAssignmentCheckStatus = {
	id: string;
	isPresent: boolean;
	checkTime: string;
	observation: string | null;
	digitalBlackboardUseStatus: DigitalBlackboardUseStatus | null;
	syncStatus?: 'pending' | 'synced';
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

export type TCreateCheck = {
	courseClassroomId: string;
	checkDate: string;
	checkTime: string;
	isPresent: boolean;
	observation?: string;
	offlineId?: string;
	digitalBlackboardUseStatus?: DigitalBlackboardUseStatus;
};

export type TScheduleComplianceCheck = {
	id: string;
	courseClassroomId: string;
	monitorId: string;
	buildingId: string;
	checkDate: string;
	checkTime: string;
	isPresent: boolean;
	digitalBlackboardUseStatus: DigitalBlackboardUseStatus | null;
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
	periodId?: string;
	centerDepartmentId?: string;
};

export enum EReportGroupBy {
	DAY = 'day',
	TEACHER = 'teacher',
	BUILDING = 'building',
	CENTER = 'center',
	CENTER_DEPARTMENT = 'centerDepartment',
	PERIOD = 'period',
}

export type TReportFilters = TCheckFilters & {
	groupBy?: EReportGroupBy;
};

export type TMonitorReportSummary = {
	totalChecks: number;
	present: number;
	absent: number;
	complianceRate: number | null;
};

export type TMonitorReportGroup = TMonitorReportSummary & {
	groupKey: string;
	groupLabel: string;
};

export type TMonitorReport = TMonitorReportSummary & {
	groups?: TMonitorReportGroup[];
};
