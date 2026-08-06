export type AnalyticsDomain =
	| 'academic-load'
	| 'enrollment'
	| 'classrooms'
	| 'staff'
	| 'technology'
	| 'activities'
	| 'monitoring';

export type AnalyticsFilterMode = 'hidden' | 'locked' | 'selectable';

export interface AnalyticsPeriodOption {
	id: string;
	label: string;
	year: number;
	pac: number;
	modality: string;
	startDate: string;
	endDate: string;
}

export interface AnalyticsCenterDepartmentOption {
	id: string;
	label: string;
	centerName: string;
	departmentName: string;
}

export interface AnalyticsTeacherOption {
	id: string;
	label: string;
	name: string;
	code: string;
}

export interface AnalyticsBuildingOption {
	id: string;
	label: string;
	name: string;
	centerId: string;
	centerName: string;
}

export interface AnalyticsDomainFilterContext {
	filters: {
		centerDepartmentId: AnalyticsFilterMode;
		teacherId: AnalyticsFilterMode;
	};
	defaults: {
		centerDepartmentId: string | null;
		teacherId: string | null;
	};
	options: {
		centerDepartments: AnalyticsCenterDepartmentOption[];
		teachers: AnalyticsTeacherOption[];
	};
}

export interface AnalyticsCatalogOption {
	id: string;
	label: string;
}

export interface StaffDomainFilterContext extends AnalyticsDomainFilterContext {
	catalogs: {
		contractTypes: AnalyticsCatalogOption[];
		categories: AnalyticsCatalogOption[];
		shifts: AnalyticsCatalogOption[];
		positions: AnalyticsCatalogOption[];
	};
}

export interface ActivitiesDomainFilterContext
	extends AnalyticsDomainFilterContext {
	catalogs: {
		activityTypes: AnalyticsCatalogOption[];
		availableYears: number[];
	};
}

export interface MonitoringDomainFilterContext
	extends AnalyticsDomainFilterContext {
	filters: AnalyticsDomainFilterContext['filters'] & {
		buildingId: AnalyticsFilterMode;
	};
	defaults: AnalyticsDomainFilterContext['defaults'] & {
		buildingId: string | null;
	};
	options: AnalyticsDomainFilterContext['options'] & {
		buildings: AnalyticsBuildingOption[];
	};
}

export interface AnalyticsFilterOptions {
	domains: AnalyticsDomain[];
	domainContexts: Partial<Record<AnalyticsDomain, AnalyticsDomainFilterContext>> & {
		staff?: StaffDomainFilterContext;
		activities?: ActivitiesDomainFilterContext;
		monitoring?: MonitoringDomainFilterContext;
	};
	filters: {
		periodId: AnalyticsFilterMode;
		comparisonPeriodId: AnalyticsFilterMode;
		centerDepartmentId: AnalyticsFilterMode;
		teacherId: AnalyticsFilterMode;
	};
	defaults: {
		periodId: string | null;
		comparisonPeriodId: string | null;
		centerDepartmentId: string | null;
		teacherId: string | null;
	};
	options: {
		periods: AnalyticsPeriodOption[];
		centerDepartments: AnalyticsCenterDepartmentOption[];
		teachers: AnalyticsTeacherOption[];
	};
	capabilities: {
		canComparePeriods: boolean;
		canExport: boolean;
	};
}

export interface AcademicLoadFilters {
	periodId: string;
	comparisonPeriodId?: string;
	centerDepartmentId?: string;
	teacherId?: string;
}

export type EnrollmentFilters = AcademicLoadFilters;

export const CLASSROOM_DAY_CODES = [
	'Lu',
	'Ma',
	'Mi',
	'Ju',
	'Vi',
	'Sa',
	'Do',
] as const;

export type ClassroomDayOfWeek = (typeof CLASSROOM_DAY_CODES)[number];

export const isClassroomDayOfWeek = (
	value: string | null
): value is ClassroomDayOfWeek => {
	switch (value) {
		case 'Lu':
		case 'Ma':
		case 'Mi':
		case 'Ju':
		case 'Vi':
		case 'Sa':
		case 'Do':
			return true;
		default:
			return false;
	}
};

export interface ClassroomAvailabilityFilters {
	periodId: string;
	centerDepartmentId?: string;
	dayOfWeek: ClassroomDayOfWeek;
	startTime: string;
	endTime: string;
}

export type AnalyticsDataStatus =
	| 'complete'
	| 'partial'
	| 'unavailable'
	| 'not_applicable';

export interface AnalyticsComparison {
	current: number | null;
	comparison: number | null;
	absoluteChange: number | null;
	percentageChange: number | null;
	currentDataStatus: AnalyticsDataStatus;
	comparisonDataStatus: AnalyticsDataStatus;
	currentCoverage?: AnalyticsCoverage;
	comparisonCoverage?: AnalyticsCoverage;
}

export type AnalyticsMetricUnit =
	| 'sections'
	| 'courses'
	| 'uv'
	| 'enrollments'
	| 'classrooms'
	| 'capacity'
	| 'teachers'
	| 'activities'
	| 'equipment'
	| 'checks'
	| 'percentage';

export type AnalyticsCoverageReason =
	| 'missing_enrollment'
	| 'missing_classroom_capacity'
	| 'invalid_classroom_capacity'
	| 'invalid_schedule_days'
	| 'invalid_schedule_section'
	| 'missing_assignment_report'
	| 'unknown_digital_blackboard_use'
	| 'missing_digital_blackboard_use';

export interface AnalyticsCoverage {
	included: number;
	total: number;
	excluded: number;
	reasons: AnalyticsCoverageReason[];
}

export type AnalyticsMetricNote =
	| 'current_classroom_capacity'
	| 'current_classroom_catalog'
	| 'current_inventory_catalog'
	| 'potential_technology_coverage'
	| 'section_enrollments_not_unique_students'
	| 'current_staff_attributes'
	| 'current_position_catalog'
	| 'current_activity_type_catalog'
	| 'assignment_reports_without_workflow'
	| 'observed_digital_blackboard_use';

export interface AnalyticsMetricResult {
	key: string;
	value: number | null;
	unit: AnalyticsMetricUnit;
	dataStatus: AnalyticsDataStatus;
	coverage?: AnalyticsCoverage;
	notes?: AnalyticsMetricNote[];
	numerator?: number;
	denominator?: number;
	comparison?: AnalyticsComparison | null;
}

export type AcademicLoadMetricKey =
	| 'offeredSections'
	| 'distinctCourses'
	| 'assignedUvs'
	| 'assignedTeachers'
	| 'averageSectionsPerTeacher'
	| 'averageUvsPerTeacher';

export type AcademicScheduleCoverageReason =
	| 'invalid_schedule_days'
	| 'invalid_schedule_section';

export interface AcademicLoadSummary {
	periodId: string;
	comparisonPeriodId: string | null;
	metrics: Record<AcademicLoadMetricKey, AnalyticsMetricResult>;
	scheduleDistribution: {
		items: {
			dayOfWeek: ClassroomDayOfWeek;
			startTime: string;
			endTime: string;
			meetingCount: number;
		}[];
		coverage: {
			included: number;
			total: number;
			excluded: number;
			reasons: AcademicScheduleCoverageReason[];
		};
		dataStatus: 'complete' | 'partial' | 'unavailable';
	};
}

export type AcademicLoadDetailSort =
	| 'name:asc'
	| 'name:desc'
	| 'code:asc'
	| 'code:desc'
	| 'sectionCount:asc'
	| 'sectionCount:desc'
	| 'distinctCourseCount:asc'
	| 'distinctCourseCount:desc'
	| 'assignedUvs:asc'
	| 'assignedUvs:desc';

export const ACADEMIC_LOAD_DETAIL_SORTS = [
	'name:asc',
	'name:desc',
	'code:asc',
	'code:desc',
	'sectionCount:asc',
	'sectionCount:desc',
	'distinctCourseCount:asc',
	'distinctCourseCount:desc',
	'assignedUvs:asc',
	'assignedUvs:desc',
] satisfies readonly AcademicLoadDetailSort[];

const academicLoadDetailSortSet: ReadonlySet<string> = new Set(
	ACADEMIC_LOAD_DETAIL_SORTS
);

export const isAcademicLoadDetailSort = (
	value: string | null
): value is AcademicLoadDetailSort =>
	value !== null && academicLoadDetailSortSet.has(value);

export interface AcademicLoadDetailsFilters extends AcademicLoadFilters {
	metric: 'teacher_load';
	page?: string;
	size?: string;
	sort?: AcademicLoadDetailSort;
}

export interface AcademicLoadDetailsExportFilters {
	periodId: string;
	metric: 'teacher_load';
	centerDepartmentId?: string;
	teacherId?: string;
	sort?: AcademicLoadDetailSort;
}

export interface AcademicLoadDetailRow {
	teacherId: string;
	name: string;
	code: string;
	sectionCount: number;
	distinctCourseCount: number;
	assignedUvs: number;
}

export interface AcademicLoadDetails {
	metric: 'teacher_load';
	rows: AcademicLoadDetailRow[];
	meta: {
		page: number;
		size: number;
		total: number;
	};
}

export type EnrollmentMetricKey =
	| 'reportedEnrollments'
	| 'averageEnrollmentPerSection'
	| 'sectionsOverCapacity'
	| 'availablePhysicalSeats'
	| 'occupancyRate'
	| 'enrollmentDataCoverage';

export interface EnrollmentSummary {
	periodId: string;
	comparisonPeriodId: string | null;
	metrics: Record<EnrollmentMetricKey, AnalyticsMetricResult>;
}

export type EnrollmentDetailSort =
	| 'courseCode:asc'
	| 'courseCode:desc'
	| 'teacherName:asc'
	| 'teacherName:desc'
	| 'classroomName:asc'
	| 'classroomName:desc'
	| 'studentCount:asc'
	| 'studentCount:desc'
	| 'occupancyRate:asc'
	| 'occupancyRate:desc';

export const ENROLLMENT_DETAIL_SORTS = [
	'courseCode:asc',
	'courseCode:desc',
	'teacherName:asc',
	'teacherName:desc',
	'classroomName:asc',
	'classroomName:desc',
	'studentCount:asc',
	'studentCount:desc',
	'occupancyRate:asc',
	'occupancyRate:desc',
] satisfies readonly EnrollmentDetailSort[];

export const isEnrollmentDetailSort = (
	value: string | null
): value is EnrollmentDetailSort => {
	switch (value) {
		case 'courseCode:asc':
		case 'courseCode:desc':
		case 'teacherName:asc':
		case 'teacherName:desc':
		case 'classroomName:asc':
		case 'classroomName:desc':
		case 'studentCount:asc':
		case 'studentCount:desc':
		case 'occupancyRate:asc':
		case 'occupancyRate:desc':
			return true;
		default:
			return false;
	}
};

export type EnrollmentDetailsFilters = Omit<
	EnrollmentFilters,
	'comparisonPeriodId'
> & {
	metric: 'enrollment_capacity';
	page?: string;
	size?: string;
	sort?: EnrollmentDetailSort;
};

export interface EnrollmentDetailsExportFilters {
	periodId: string;
	metric: 'enrollment_capacity';
	centerDepartmentId?: string;
	teacherId?: string;
	sort?: EnrollmentDetailSort;
}

export interface EnrollmentDetailRow {
	sectionId: string;
	courseCode: string;
	courseName: string;
	groupCode: string;
	teacherId: string;
	teacherName: string;
	classroomId: string;
	classroomName: string;
	studentCount: number | null;
	maxCapacity: number | null;
	occupancyRate: number | null;
	availableSeats: number | null;
	overCapacity: boolean | null;
}

export interface EnrollmentDetails {
	metric: 'enrollment_capacity';
	periodId: string;
	notes: AnalyticsMetricNote[];
	rows: EnrollmentDetailRow[];
	meta: {
		page: number;
		size: number;
		total: number;
	};
}

export type ClassroomAvailabilityMetricKey =
	| 'eligibleClassrooms'
	| 'occupiedClassrooms'
	| 'availableClassrooms'
	| 'indeterminateClassrooms'
	| 'occupancyRate';

export interface ClassroomAvailabilitySummary
	extends ClassroomAvailabilityFilters {
	notes: AnalyticsMetricNote[];
	metrics: Record<ClassroomAvailabilityMetricKey, AnalyticsMetricResult>;
}

export type ClassroomAvailabilitySort =
	| 'status:asc'
	| 'status:desc'
	| 'classroomName:asc'
	| 'classroomName:desc'
	| 'buildingName:asc'
	| 'buildingName:desc';

export const CLASSROOM_AVAILABILITY_SORTS = [
	'status:asc',
	'status:desc',
	'classroomName:asc',
	'classroomName:desc',
	'buildingName:asc',
	'buildingName:desc',
] satisfies readonly ClassroomAvailabilitySort[];

export const isClassroomAvailabilitySort = (
	value: string | null
): value is ClassroomAvailabilitySort => {
	switch (value) {
		case 'status:asc':
		case 'status:desc':
		case 'classroomName:asc':
		case 'classroomName:desc':
		case 'buildingName:asc':
		case 'buildingName:desc':
			return true;
		default:
			return false;
	}
};

export interface ClassroomAvailabilityDetailsFilters
	extends ClassroomAvailabilityFilters {
	metric: 'classroom_availability';
	page?: string;
	size?: string;
	sort?: ClassroomAvailabilitySort;
}

export interface ClassroomAvailabilityExportFilters
	extends ClassroomAvailabilityFilters {
	metric: 'classroom_availability';
	sort?: ClassroomAvailabilitySort;
}

export type ClassroomAvailabilityStatus =
	| 'occupied'
	| 'available'
	| 'indeterminate';

export type ClassroomAvailabilityConflict =
	| {
			visibility: 'full';
			startTime: string;
			endTime: string;
			courseCode: string;
			courseName: string;
			groupCode: string;
			teacherName: string;
	  }
	| {
			visibility: 'restricted';
			startTime: string;
			endTime: string;
	  };

export type ClassroomScheduleIssue =
	| {
			visibility: 'full';
			reason: 'invalid_schedule_days' | 'invalid_schedule_section';
			rawDays: string;
			rawSection: string;
	  }
	| {
			visibility: 'restricted';
			reason: 'invalid_schedule_days' | 'invalid_schedule_section';
	  };

export interface ClassroomAvailabilityRow {
	classroomId: string;
	classroomName: string;
	buildingId: string;
	buildingName: string;
	centerId: string;
	centerName: string;
	status: ClassroomAvailabilityStatus;
	dataStatus: 'complete' | 'partial';
	conflictCount: number;
	conflicts: ClassroomAvailabilityConflict[];
	scheduleIssues: ClassroomScheduleIssue[];
}

export interface ClassroomAvailabilityDetails
	extends ClassroomAvailabilityFilters {
	metric: 'classroom_availability';
	notes: AnalyticsMetricNote[];
	rows: ClassroomAvailabilityRow[];
	meta: {
		page: number;
		size: number;
		total: number;
	};
}
