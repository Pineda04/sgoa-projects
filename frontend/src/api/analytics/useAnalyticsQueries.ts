import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@config';
import { analyticsOptions } from './analytics.options';
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

const useAnalyticsUserId = () => useAuth().authState.user?.sub ?? null;

export const useAnalyticsFilterOptions = (
	centerDepartmentId?: string,
	config?: { enabled?: boolean },
	buildingId?: string
) => {
	const userId = useAnalyticsUserId();
	return useQuery({
		...analyticsOptions.filterOptions(
			userId,
			centerDepartmentId,
			buildingId
		),
		enabled: config?.enabled,
	});
};

export const useAcademicLoad = (filters?: AcademicLoadFilters) => {
	const userId = useAnalyticsUserId();
	return useQuery({
		...analyticsOptions.academicLoad(userId, filters),
		enabled: Boolean(filters?.periodId),
	});
};

export const useAcademicLoadDetails = (
	filters?: AcademicLoadDetailsFilters
) => {
	const userId = useAnalyticsUserId();
	return useQuery({
		...analyticsOptions.academicLoadDetails(userId, filters),
		enabled: Boolean(filters?.periodId),
	});
};

export const useEnrollment = (filters?: EnrollmentFilters) => {
	const userId = useAnalyticsUserId();
	return useQuery({
		...analyticsOptions.enrollment(userId, filters),
		enabled: Boolean(filters?.periodId),
	});
};

export const useEnrollmentDetails = (filters?: EnrollmentDetailsFilters) => {
	const userId = useAnalyticsUserId();
	return useQuery({
		...analyticsOptions.enrollmentDetails(userId, filters),
		enabled: Boolean(filters?.periodId),
	});
};

export const useClassroomAvailability = (
	filters?: ClassroomAvailabilityFilters
) => {
	const userId = useAnalyticsUserId();
	return useQuery({
		...analyticsOptions.classroomAvailability(userId, filters),
		enabled: Boolean(filters?.periodId),
	});
};

export const useClassroomAvailabilityDetails = (
	filters?: ClassroomAvailabilityDetailsFilters
) => {
	const userId = useAnalyticsUserId();
	return useQuery({
		...analyticsOptions.classroomAvailabilityDetails(userId, filters),
		enabled: Boolean(filters?.periodId),
	});
};

export const useClassroomCapacity = (filters?: PeriodCenterFilters) => {
	const userId = useAnalyticsUserId();
	return useQuery({
		...analyticsOptions.classroomCapacity(userId, filters),
		enabled: Boolean(filters?.periodId),
	});
};

export const useClassroomCapacityDetails = (
	filters?: ClassroomCapacityFilters
) => {
	const userId = useAnalyticsUserId();
	return useQuery({
		...analyticsOptions.classroomCapacityDetails(userId, filters),
		enabled: Boolean(filters?.periodId),
	});
};

export const useTechnology = (filters?: PeriodCenterFilters) => {
	const userId = useAnalyticsUserId();
	return useQuery({
		...analyticsOptions.technology(userId, filters),
		enabled: Boolean(filters?.periodId),
	});
};

export const useTechnologyDetails = (filters?: TechnologyDetailsFilters) => {
	const userId = useAnalyticsUserId();
	return useQuery({
		...analyticsOptions.technologyDetails(userId, filters),
		enabled: Boolean(filters?.periodId),
	});
};

export const useStaff = (filters?: StaffFilters) => {
	const userId = useAnalyticsUserId();
	return useQuery({
		...analyticsOptions.staff(userId, filters),
		enabled: Boolean(filters),
	});
};

export const useStaffDetails = (filters?: StaffDetailsFilters) => {
	const userId = useAnalyticsUserId();
	return useQuery({
		...analyticsOptions.staffDetails(userId, filters),
		enabled: Boolean(filters),
	});
};

export const useActivities = (filters?: ActivityFilters) => {
	const userId = useAnalyticsUserId();
	return useQuery({
		...analyticsOptions.activities(userId, filters),
		enabled: Boolean(filters?.periodId || filters?.year),
	});
};

export const useActivityDetails = (filters?: ActivityDetailsFilters) => {
	const userId = useAnalyticsUserId();
	return useQuery({
		...analyticsOptions.activityDetails(userId, filters),
		enabled: Boolean(filters?.periodId || filters?.year),
	});
};

export const useMonitoring = (filters?: MonitoringFilters) => {
	const userId = useAnalyticsUserId();
	return useQuery({
		...analyticsOptions.monitoring(userId, filters),
		enabled: Boolean(filters),
	});
};

export const useMonitoringDetails = (filters?: MonitoringDetailsFilters) => {
	const userId = useAnalyticsUserId();
	return useQuery({
		...analyticsOptions.monitoringDetails(userId, filters),
		enabled: Boolean(filters),
	});
};
