import { queryOptions } from '@tanstack/react-query';
import { STALE_TIME } from '@config';
import { analyticsApi } from './analytics.api';
import { analyticsKeys } from './analytics.keys';
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

export const analyticsOptions = {
	filterOptions: (
		userId: string | null,
		centerDepartmentId?: string,
		buildingId?: string
	) =>
		queryOptions({
			queryKey: analyticsKeys.filterOptions(
				userId,
				centerDepartmentId,
				buildingId
			),
			queryFn: () => analyticsApi.getFilterOptions(centerDepartmentId, buildingId),
			select: response => response.data.data,
			staleTime: STALE_TIME.SHORT,
			retry: false,
			refetchOnWindowFocus: true,
		}),
	academicLoad: (userId: string | null, filters?: AcademicLoadFilters) =>
		queryOptions({
			queryKey: analyticsKeys.academicLoad(userId, filters),
			queryFn: () => {
				if (!filters) throw new Error('Se requiere un período académico.');
				return analyticsApi.getAcademicLoad(filters);
			},
			select: response => response.data.data,
			retry: false,
			refetchOnWindowFocus: false,
		}),
	academicLoadDetails: (userId: string | null, filters?: AcademicLoadDetailsFilters) =>
		queryOptions({
			queryKey: analyticsKeys.academicLoadDetails(userId, filters),
			queryFn: () => {
				if (!filters) throw new Error('Se requiere un período académico.');
				return analyticsApi.getAcademicLoadDetails(filters);
			},
			select: response => response.data.data,
			retry: false,
			refetchOnWindowFocus: false,
		}),
	enrollment: (userId: string | null, filters?: EnrollmentFilters) =>
		queryOptions({
			queryKey: analyticsKeys.enrollment(userId, filters),
			queryFn: () => {
				if (!filters) throw new Error('Se requiere un período académico.');
				return analyticsApi.getEnrollment(filters);
			},
			select: response => response.data.data,
			retry: false,
			refetchOnWindowFocus: false,
		}),
	enrollmentDetails: (userId: string | null, filters?: EnrollmentDetailsFilters) =>
		queryOptions({
			queryKey: analyticsKeys.enrollmentDetails(userId, filters),
			queryFn: () => {
				if (!filters) throw new Error('Se requiere un período académico.');
				return analyticsApi.getEnrollmentDetails(filters);
			},
			select: response => response.data.data,
			retry: false,
			refetchOnWindowFocus: false,
		}),
	classroomAvailability: (userId: string | null, filters?: ClassroomAvailabilityFilters) =>
		queryOptions({
			queryKey: analyticsKeys.classroomAvailability(userId, filters),
			queryFn: () => {
				if (!filters) throw new Error('Se requieren período y rango horario.');
				return analyticsApi.getClassroomAvailability(filters);
			},
			select: response => response.data.data,
			retry: false,
			refetchOnWindowFocus: false,
		}),
	classroomAvailabilityDetails: (
		userId: string | null,
		filters?: ClassroomAvailabilityDetailsFilters
	) =>
		queryOptions({
			queryKey: analyticsKeys.classroomAvailabilityDetails(userId, filters),
			queryFn: () => {
				if (!filters) throw new Error('Se requieren período y rango horario.');
				return analyticsApi.getClassroomAvailabilityDetails(filters);
			},
			select: response => response.data.data,
			retry: false,
			refetchOnWindowFocus: false,
		}),
	classroomCapacity: (userId: string | null, filters?: PeriodCenterFilters) =>
		queryOptions({
			queryKey: analyticsKeys.classroomCapacity(userId, filters),
			queryFn: () => {
				if (!filters) throw new Error('Se requiere un período académico.');
				return analyticsApi.getClassroomCapacity(filters);
			},
			select: response => response.data.data,
			retry: false,
			refetchOnWindowFocus: false,
		}),
	classroomCapacityDetails: (userId: string | null, filters?: ClassroomCapacityFilters) =>
		queryOptions({
			queryKey: analyticsKeys.classroomCapacityDetails(userId, filters),
			queryFn: () => {
				if (!filters) throw new Error('Se requiere un período académico.');
				return analyticsApi.getClassroomCapacityDetails(filters);
			},
			select: response => response.data.data,
			retry: false,
			refetchOnWindowFocus: false,
		}),
	technology: (userId: string | null, filters?: PeriodCenterFilters) =>
		queryOptions({
			queryKey: analyticsKeys.technology(userId, filters),
			queryFn: () => {
				if (!filters) throw new Error('Se requiere un período académico.');
				return analyticsApi.getTechnology(filters);
			},
			select: response => response.data.data,
			retry: false,
			refetchOnWindowFocus: false,
		}),
	technologyDetails: (userId: string | null, filters?: TechnologyDetailsFilters) =>
		queryOptions({
			queryKey: analyticsKeys.technologyDetails(userId, filters),
			queryFn: () => {
				if (!filters) throw new Error('Se requiere un período académico.');
				return analyticsApi.getTechnologyDetails(filters);
			},
			select: response => response.data.data,
			retry: false,
			refetchOnWindowFocus: false,
		}),
	staff: (userId: string | null, filters?: StaffFilters) =>
		queryOptions({
			queryKey: analyticsKeys.staff(userId, filters),
			queryFn: () => analyticsApi.getStaff(filters ?? {}),
			select: response => response.data.data,
			retry: false,
			refetchOnWindowFocus: false,
		}),
	staffDetails: (userId: string | null, filters?: StaffDetailsFilters) =>
		queryOptions({
			queryKey: analyticsKeys.staffDetails(userId, filters),
			queryFn: () => {
				if (!filters) throw new Error('No hay filtros autorizados de personal.');
				return analyticsApi.getStaffDetails(filters);
			},
			select: response => response.data.data,
			retry: false,
			refetchOnWindowFocus: false,
		}),
	activities: (userId: string | null, filters?: ActivityFilters) =>
		queryOptions({
			queryKey: analyticsKeys.activities(userId, filters),
			queryFn: () => {
				if (!filters) throw new Error('Se requiere un alcance temporal.');
				return analyticsApi.getActivities(filters);
			},
			select: response => response.data.data,
			retry: false,
			refetchOnWindowFocus: false,
		}),
	activityDetails: (userId: string | null, filters?: ActivityDetailsFilters) =>
		queryOptions({
			queryKey: analyticsKeys.activityDetails(userId, filters),
			queryFn: () => {
				if (!filters) throw new Error('Se requiere un alcance temporal.');
				return analyticsApi.getActivityDetails(filters);
			},
			select: response => response.data.data,
			retry: false,
			refetchOnWindowFocus: false,
		}),
	monitoring: (userId: string | null, filters?: MonitoringFilters) =>
		queryOptions({
			queryKey: analyticsKeys.monitoring(userId, filters),
			queryFn: () => analyticsApi.getMonitoring(filters ?? {}),
			select: response => response.data.data,
			staleTime: 60_000,
			retry: false,
			refetchOnWindowFocus: true,
		}),
	monitoringDetails: (
		userId: string | null,
		filters?: MonitoringDetailsFilters
	) =>
		queryOptions({
			queryKey: analyticsKeys.monitoringDetails(userId, filters),
			queryFn: () => {
				if (!filters) throw new Error('No hay filtros autorizados de monitoreo.');
				return analyticsApi.getMonitoringDetails(filters);
			},
			select: response => response.data.data,
			staleTime: 60_000,
			retry: false,
			refetchOnWindowFocus: true,
		}),
};
