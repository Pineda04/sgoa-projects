import type {
	AcademicLoadDetailsFilters,
	AcademicLoadFilters,
	ClassroomAvailabilityDetailsFilters,
	ClassroomAvailabilityFilters,
	EnrollmentDetailsFilters,
	EnrollmentFilters,
} from './analytics.types';
import type {
	ActivityDetailsFilters,
	ActivityFilters,
	ClassroomCapacityFilters,
	PeriodCenterFilters,
	StaffDetailsFilters,
	StaffFilters,
	TechnologyDetailsFilters,
} from './analytics.phase3-4.types';
import type {
	MonitoringDetailsFilters,
	MonitoringFilters,
} from './analytics.phase5.types';

const normalizeFilters = (
	filters?: AcademicLoadFilters | EnrollmentFilters
) => ({
	periodId: filters?.periodId ?? null,
	comparisonPeriodId: filters?.comparisonPeriodId ?? null,
	centerDepartmentId: filters?.centerDepartmentId ?? null,
	teacherId: filters?.teacherId ?? null,
});

const normalizeClassroomFilters = (filters?: ClassroomAvailabilityFilters) => ({
	periodId: filters?.periodId ?? null,
	centerDepartmentId: filters?.centerDepartmentId ?? null,
	dayOfWeek: filters?.dayOfWeek ?? null,
	startTime: filters?.startTime ?? null,
	endTime: filters?.endTime ?? null,
});

const normalizePeriodCenterFilters = (filters?: PeriodCenterFilters) => ({
	periodId: filters?.periodId ?? null,
	centerDepartmentId: filters?.centerDepartmentId ?? null,
});

const normalizeStaffFilters = (filters?: StaffFilters) => ({
	centerDepartmentId: filters?.centerDepartmentId ?? null,
	teacherId: filters?.teacherId ?? null,
	contractTypeId: filters?.contractTypeId ?? null,
	categoryId: filters?.categoryId ?? null,
	shiftId: filters?.shiftId ?? null,
	positionId: filters?.positionId ?? null,
});

const normalizeActivityFilters = (filters?: ActivityFilters) => ({
	periodId: filters?.periodId ?? null,
	year: filters?.year ?? null,
	pac: filters?.pac ?? null,
	pacModality: filters?.pacModality ?? null,
	centerDepartmentId: filters?.centerDepartmentId ?? null,
	teacherId: filters?.teacherId ?? null,
	activityTypeId: filters?.activityTypeId ?? null,
});

const normalizeMonitoringFilters = (filters?: MonitoringFilters) => ({
	dateFrom: filters?.dateFrom ?? null,
	dateTo: filters?.dateTo ?? null,
	periodId: filters?.periodId ?? null,
	centerId: filters?.centerId ?? null,
	centerDepartmentId: filters?.centerDepartmentId ?? null,
	teacherId: filters?.teacherId ?? null,
	buildingId: filters?.buildingId ?? null,
});

export const analyticsKeys = {
	all: (userId: string | null) => ['analytics', userId] as const,
	filterOptions: (
		userId: string | null,
		centerDepartmentId?: string,
		buildingId?: string
	) => [
		...analyticsKeys.all(userId),
		'filter-options',
		{
			centerDepartmentId: centerDepartmentId ?? null,
			buildingId: buildingId ?? null,
		},
	],
	academicLoad: (userId: string | null, filters?: AcademicLoadFilters) => [
		...analyticsKeys.all(userId),
		'academic-load',
		'summary',
		normalizeFilters(filters),
	],
	academicLoadDetails: (
		userId: string | null,
		filters?: AcademicLoadDetailsFilters
	) => [
		...analyticsKeys.all(userId),
		'academic-load',
		'details',
		{
			...normalizeFilters(filters),
			metric: filters?.metric ?? 'teacher_load',
			page: filters?.page ?? '1',
			size: filters?.size ?? '25',
			sort: filters?.sort ?? 'name:asc',
		},
	],
	enrollment: (userId: string | null, filters?: EnrollmentFilters) => [
		...analyticsKeys.all(userId),
		'enrollment',
		'summary',
		normalizeFilters(filters),
	],
	enrollmentDetails: (
		userId: string | null,
		filters?: EnrollmentDetailsFilters
	) => [
		...analyticsKeys.all(userId),
		'enrollment',
		'details',
		{
			...normalizeFilters(filters),
			metric: filters?.metric ?? 'enrollment_capacity',
			page: filters?.page ?? '1',
			size: filters?.size ?? '25',
			sort: filters?.sort ?? 'courseCode:asc',
		},
	],
	classroomAvailability: (
		userId: string | null,
		filters?: ClassroomAvailabilityFilters
	) => [
		...analyticsKeys.all(userId),
		'classrooms',
		'summary',
		normalizeClassroomFilters(filters),
	],
	classroomAvailabilityDetails: (
		userId: string | null,
		filters?: ClassroomAvailabilityDetailsFilters
	) => [
		...analyticsKeys.all(userId),
		'classrooms',
		'details',
		{
			...normalizeClassroomFilters(filters),
			metric: filters?.metric ?? 'classroom_availability',
			page: filters?.page ?? '1',
			size: filters?.size ?? '25',
			sort: filters?.sort ?? 'classroomName:asc',
		},
	],
	classroomCapacity: (
		userId: string | null,
		filters?: PeriodCenterFilters
	) => [
		...analyticsKeys.all(userId),
		'classrooms',
		'capacity',
		'summary',
		normalizePeriodCenterFilters(filters),
	],
	classroomCapacityDetails: (
		userId: string | null,
		filters?: ClassroomCapacityFilters
	) => [
		...analyticsKeys.all(userId),
		'classrooms',
		'capacity',
		'details',
		{
			...normalizePeriodCenterFilters(filters),
			metric: filters?.metric ?? 'installed_capacity',
			page: filters?.page ?? '1',
			size: filters?.size ?? '25',
			sort: filters?.sort ?? 'classroomName:asc',
		},
	],
	technology: (userId: string | null, filters?: PeriodCenterFilters) => [
		...analyticsKeys.all(userId),
		'technology',
		'summary',
		normalizePeriodCenterFilters(filters),
	],
	technologyDetails: (
		userId: string | null,
		filters?: TechnologyDetailsFilters
	) => [
		...analyticsKeys.all(userId),
		'technology',
		'details',
		{
			...normalizePeriodCenterFilters(filters),
			metric: filters?.metric ?? null,
			page: filters?.page ?? '1',
			size: filters?.size ?? '25',
			sort: filters?.sort ?? null,
		},
	],
	staff: (userId: string | null, filters?: StaffFilters) => [
		...analyticsKeys.all(userId),
		'staff',
		'summary',
		normalizeStaffFilters(filters),
	],
	staffDetails: (userId: string | null, filters?: StaffDetailsFilters) => [
		...analyticsKeys.all(userId),
		'staff',
		'details',
		{
			...normalizeStaffFilters(filters),
			metric: filters?.metric ?? 'staff_current',
			page: filters?.page ?? '1',
			size: filters?.size ?? '25',
			sort: filters?.sort ?? 'name:asc',
		},
	],
	activities: (userId: string | null, filters?: ActivityFilters) => [
		...analyticsKeys.all(userId),
		'activities',
		'summary',
		normalizeActivityFilters(filters),
	],
	activityDetails: (
		userId: string | null,
		filters?: ActivityDetailsFilters
	) => [
		...analyticsKeys.all(userId),
		'activities',
		'details',
		{
			...normalizeActivityFilters(filters),
			metric: filters?.metric ?? 'activities',
			page: filters?.page ?? '1',
			size: filters?.size ?? '25',
			sort: filters?.sort ?? 'activityName:asc',
		},
	],
	monitoring: (userId: string | null, filters?: MonitoringFilters) => [
		...analyticsKeys.all(userId),
		'monitoring',
		'summary',
		normalizeMonitoringFilters(filters),
	],
	monitoringDetails: (
		userId: string | null,
		filters?: MonitoringDetailsFilters
	) => [
		...analyticsKeys.all(userId),
		'monitoring',
		'details',
		{
			...normalizeMonitoringFilters(filters),
			metric: filters?.metric ?? 'monitoring_checks',
			page: filters?.page ?? '1',
			size: filters?.size ?? '25',
			sort: filters?.sort ?? 'checkDate:desc',
		},
	],
};
