import type {
	AnalyticsDataStatus,
	AnalyticsMetricNote,
	AnalyticsMetricResult,
} from './analytics.types';

export interface PeriodCenterFilters {
	periodId: string;
	centerDepartmentId?: string;
}

export interface AnalyticsPageMeta {
	page: number;
	size: number;
	total: number;
}

export interface AnalyticsDistributionItem {
	id: string;
	label: string;
	value: number;
	percentage: number;
}

export interface AnalyticsDistribution {
	items: AnalyticsDistributionItem[];
	denominator: number;
	dataStatus: AnalyticsDataStatus;
}

export type ClassroomCapacitySort =
	| 'classroomName:asc'
	| 'classroomName:desc'
	| 'buildingName:asc'
	| 'buildingName:desc'
	| 'maxCapacity:asc'
	| 'maxCapacity:desc'
	| 'capacityStatus:asc'
	| 'capacityStatus:desc';

export const isClassroomCapacitySort = (
	value: string | null
): value is ClassroomCapacitySort => {
	switch (value) {
		case 'classroomName:asc':
		case 'classroomName:desc':
		case 'buildingName:asc':
		case 'buildingName:desc':
		case 'maxCapacity:asc':
		case 'maxCapacity:desc':
		case 'capacityStatus:asc':
		case 'capacityStatus:desc':
			return true;
		default:
			return false;
	}
};

export interface ClassroomCapacitySummary extends PeriodCenterFilters {
	notes: AnalyticsMetricNote[];
	metrics: {
		installedCapacity: AnalyticsMetricResult;
		capacityDataCoverage: AnalyticsMetricResult;
	};
}

export interface ClassroomCapacityFilters extends PeriodCenterFilters {
	metric: 'installed_capacity';
	page?: string;
	size?: string;
	sort?: ClassroomCapacitySort;
}

export interface ClassroomCapacityExportFilters extends PeriodCenterFilters {
	metric: 'installed_capacity';
	sort?: ClassroomCapacitySort;
}

export interface ClassroomCapacityRow {
	classroomId: string;
	classroomName: string;
	buildingId: string;
	buildingName: string;
	centerId: string;
	centerName: string;
	roomTypeId: string;
	roomType: string;
	maxCapacity: number | null;
	capacityStatus: 'known' | 'missing' | 'invalid';
}

export interface ClassroomCapacityDetails extends PeriodCenterFilters {
	metric: 'installed_capacity';
	notes: AnalyticsMetricNote[];
	rows: ClassroomCapacityRow[];
	meta: AnalyticsPageMeta;
}

export type TechnologyDetailMetric =
	| 'equipped_classrooms'
	| 'equipped_classroom_enrollment'
	| 'equipment_inventory';

export const isTechnologyDetailMetric = (
	value: string | null
): value is TechnologyDetailMetric => {
	switch (value) {
		case 'equipped_classrooms':
		case 'equipped_classroom_enrollment':
		case 'equipment_inventory':
			return true;
		default:
			return false;
	}
};

export type TechnologyDetailSort =
	| 'classroomName:asc'
	| 'classroomName:desc'
	| 'buildingName:asc'
	| 'buildingName:desc'
	| 'digitalBlackboardCount:asc'
	| 'digitalBlackboardCount:desc'
	| 'equipped:asc'
	| 'equipped:desc'
	| 'courseCode:asc'
	| 'courseCode:desc'
	| 'teacherName:asc'
	| 'teacherName:desc'
	| 'studentCount:asc'
	| 'studentCount:desc'
	| 'equipmentType:asc'
	| 'equipmentType:desc'
	| 'conditionLabel:asc'
	| 'conditionLabel:desc';

export interface TechnologySummary extends PeriodCenterFilters {
	notes: AnalyticsMetricNote[];
	metrics: {
		eligibleClassrooms: AnalyticsMetricResult;
		equippedClassrooms: AnalyticsMetricResult;
		digitalBlackboardCoverage: AnalyticsMetricResult;
		knownEnrollmentsInEquippedClassrooms: AnalyticsMetricResult;
		equippedEnrollmentDataCoverage: AnalyticsMetricResult;
		totalEquipment: AnalyticsMetricResult;
	};
	distributions: {
		equipmentByType: AnalyticsDistribution;
		equipmentByCondition: AnalyticsDistribution;
		equipmentByBuilding: AnalyticsDistribution;
	};
}

export interface TechnologyDetailsFilters extends PeriodCenterFilters {
	metric: TechnologyDetailMetric;
	page?: string;
	size?: string;
	sort?: TechnologyDetailSort;
}

export interface TechnologyExportFilters extends PeriodCenterFilters {
	metric: TechnologyDetailMetric;
	sort?: TechnologyDetailSort;
}

export interface TechnologyClassroomRow {
	rowType: 'equipped_classroom';
	classroomId: string;
	classroomName: string;
	buildingId: string;
	buildingName: string;
	centerId: string;
	centerName: string;
	roomType: string;
	digitalBlackboardCount: number;
	equipped: boolean;
}

export interface TechnologyEnrollmentRow {
	rowType: 'equipped_classroom_enrollment';
	sectionId: string;
	courseCode: string;
	courseName: string;
	groupCode: string;
	teacherId: string;
	teacherName: string;
	classroomId: string;
	classroomName: string;
	studentCount: number | null;
	enrollmentStatus: 'known' | 'missing';
}

export interface TechnologyInventoryRow {
	rowType: 'equipment_inventory';
	equipmentKey: string;
	equipmentId: string;
	equipmentTypeId: 'digital_blackboard' | 'pc_equipment' | 'air_conditioner';
	equipmentType: string;
	itemLabel: string | null;
	conditionId: string;
	conditionLabel: string;
	classroomId: string;
	classroomName: string;
	buildingId: string;
	buildingName: string;
	centerId: string;
	centerName: string;
}

export type TechnologyDetailRow =
	| TechnologyClassroomRow
	| TechnologyEnrollmentRow
	| TechnologyInventoryRow;

export interface TechnologyDetails extends PeriodCenterFilters {
	metric: TechnologyDetailMetric;
	notes: AnalyticsMetricNote[];
	rows: TechnologyDetailRow[];
	meta: AnalyticsPageMeta;
}

export interface StaffFilters {
	centerDepartmentId?: string;
	teacherId?: string;
	contractTypeId?: string;
	categoryId?: string;
	shiftId?: string;
	positionId?: string;
}

export type StaffDetailSort =
	| 'name:asc'
	| 'name:desc'
	| 'code:asc'
	| 'code:desc'
	| 'contractName:asc'
	| 'contractName:desc'
	| 'categoryName:asc'
	| 'categoryName:desc'
	| 'shiftName:asc'
	| 'shiftName:desc';

export interface StaffDetailsFilters extends StaffFilters {
	metric: 'staff_current';
	page?: string;
	size?: string;
	sort?: StaffDetailSort;
}

export interface StaffExportFilters extends StaffFilters {
	metric: 'staff_current';
	sort?: StaffDetailSort;
}

export interface StaffPosition {
	position: { id: string; name: string };
	centerDepartment: {
		id: string;
		label: string;
		centerName: string;
		departmentName: string;
	};
	startDate: string;
	endDate: string | null;
}

export interface StaffDetailRow {
	teacherId: string;
	name: string;
	code: string;
	contractType: { id: string; name: string };
	category: { id: string; name: string };
	shift: { id: string; name: string };
	shiftStart: string | null;
	shiftEnd: string | null;
	currentPositions: StaffPosition[];
}

export interface StaffSummary {
	asOf: string;
	notes: AnalyticsMetricNote[];
	metrics: { activeTeachers: AnalyticsMetricResult };
	distributions: {
		byContract: AnalyticsDistributionItem[];
		byCategory: AnalyticsDistributionItem[];
		byShift: AnalyticsDistributionItem[];
		byCurrentPosition: AnalyticsDistributionItem[];
	};
}

export interface StaffDetails {
	metric: 'staff_current';
	asOf: string;
	notes: AnalyticsMetricNote[];
	rows: StaffDetailRow[];
	meta: AnalyticsPageMeta;
}

export interface ActivityFilters {
	periodId?: string;
	year?: string;
	pac?: string;
	pacModality?: string;
	centerDepartmentId?: string;
	teacherId?: string;
	activityTypeId?: string;
}

export type ActivityDetailSort =
	| 'activityName:asc'
	| 'activityName:desc'
	| 'typeName:asc'
	| 'typeName:desc'
	| 'teacherName:asc'
	| 'teacherName:desc'
	| 'period:asc'
	| 'period:desc'
	| 'progressLevel:asc'
	| 'progressLevel:desc';

export interface ActivityDetailsFilters extends ActivityFilters {
	metric: 'activities';
	page?: string;
	size?: string;
	sort?: ActivityDetailSort;
}

export interface ActivityExportFilters extends ActivityFilters {
	metric: 'activities';
	sort?: ActivityDetailSort;
}

export type ActivityTemporalScope =
	| { type: 'period'; periodId: string }
	| { type: 'year'; year: number; pac?: number; pacModality?: string };

export interface ActivityDetailRow {
	id: string;
	activityName: string;
	progressLevel: string;
	isRegistered: boolean | null;
	activityType: { id: string; name: string };
	teacher: { id: string; name: string; code: string };
	assignmentReportId: string;
	period: {
		id: string;
		year: number;
		pac: number;
		pacModality: string;
		label: string;
	};
	centerDepartment: {
		id: string;
		centerName: string;
		departmentName: string;
		label: string;
	};
}

export interface ActivitySummary {
	temporalScope: ActivityTemporalScope;
	notes: AnalyticsMetricNote[];
	metrics: {
		totalActivities: AnalyticsMetricResult;
		reportedTeachers: AnalyticsMetricResult;
		averageActivitiesPerReportedTeacher: AnalyticsMetricResult;
		activeTeacherReportCoverage: AnalyticsMetricResult;
	};
	distributions: {
		byType: AnalyticsDistributionItem[];
		byPeriod: AnalyticsDistributionItem[];
		byCenterDepartment: AnalyticsDistributionItem[];
		byTeacher: AnalyticsDistributionItem[];
	};
}

export interface ActivityDetails {
	metric: 'activities';
	temporalScope: ActivityTemporalScope;
	notes: AnalyticsMetricNote[];
	rows: ActivityDetailRow[];
	meta: AnalyticsPageMeta;
}
