import { api } from '@config';
import type { IResponse } from '@shared';
import type {
	AcademicLoadDetails,
	AcademicLoadDetailsExportFilters,
	AcademicLoadDetailsFilters,
	AcademicLoadFilters,
	AcademicLoadSummary,
	AnalyticsFilterOptions,
	ClassroomAvailabilityDetails,
	ClassroomAvailabilityDetailsFilters,
	ClassroomAvailabilityExportFilters,
	ClassroomAvailabilityFilters,
	ClassroomAvailabilitySummary,
	EnrollmentDetails,
	EnrollmentDetailsExportFilters,
	EnrollmentDetailsFilters,
	EnrollmentFilters,
	EnrollmentSummary,
} from './analytics.types';
import type {
	ActivityDetails,
	ActivityDetailsFilters,
	ActivityExportFilters,
	ActivityFilters,
	ActivitySummary,
	ClassroomCapacityDetails,
	ClassroomCapacityExportFilters,
	ClassroomCapacityFilters,
	ClassroomCapacitySummary,
	PeriodCenterFilters,
	StaffDetails,
	StaffDetailsFilters,
	StaffExportFilters,
	StaffFilters,
	StaffSummary,
	TechnologyDetails,
	TechnologyDetailsFilters,
	TechnologyExportFilters,
	TechnologySummary,
} from './analytics.phase3-4.types';
import type {
	MonitoringDetails,
	MonitoringDetailsFilters,
	MonitoringExportFilters,
	MonitoringFilters,
	MonitoringSummary,
} from './analytics.phase5.types';

export const analyticsApi = {
	getFilterOptions: (centerDepartmentId?: string, buildingId?: string) =>
		api.get<IResponse<AnalyticsFilterOptions>>('/analytics/filter-options', {
			params:
				centerDepartmentId || buildingId
					? { centerDepartmentId, buildingId }
					: undefined,
		}),
	getAcademicLoad: (filters: AcademicLoadFilters) =>
		api.get<IResponse<AcademicLoadSummary>>('/analytics/academic-load', {
			params: filters,
		}),
	getAcademicLoadDetails: (filters: AcademicLoadDetailsFilters) =>
		api.get<IResponse<AcademicLoadDetails>>(
			'/analytics/academic-load/details',
			{ params: filters }
		),
	exportAcademicLoadDetails: (filters: AcademicLoadDetailsExportFilters) =>
		api.get<Blob>('/analytics/academic-load/export', {
			params: filters,
			responseType: 'blob',
		}),
	getEnrollment: (filters: EnrollmentFilters) =>
		api.get<IResponse<EnrollmentSummary>>('/analytics/enrollment', {
			params: filters,
		}),
	getEnrollmentDetails: (filters: EnrollmentDetailsFilters) =>
		api.get<IResponse<EnrollmentDetails>>('/analytics/enrollment/details', {
			params: filters,
		}),
	exportEnrollmentDetails: (filters: EnrollmentDetailsExportFilters) =>
		api.get<Blob>('/analytics/enrollment/export', {
			params: filters,
			responseType: 'blob',
		}),
	getClassroomAvailability: (filters: ClassroomAvailabilityFilters) =>
		api.get<IResponse<ClassroomAvailabilitySummary>>('/analytics/classrooms', {
			params: filters,
		}),
	getClassroomAvailabilityDetails: (
		filters: ClassroomAvailabilityDetailsFilters
	) =>
		api.get<IResponse<ClassroomAvailabilityDetails>>(
			'/analytics/classrooms/details',
			{ params: filters }
		),
	exportClassroomAvailabilityDetails: (
		filters: ClassroomAvailabilityExportFilters
	) =>
		api.get<Blob>('/analytics/classrooms/export', {
			params: filters,
			responseType: 'blob',
		}),
	getClassroomCapacity: (filters: PeriodCenterFilters) =>
		api.get<IResponse<ClassroomCapacitySummary>>(
			'/analytics/classrooms/capacity',
			{ params: filters }
		),
	getClassroomCapacityDetails: (filters: ClassroomCapacityFilters) =>
		api.get<IResponse<ClassroomCapacityDetails>>(
			'/analytics/classrooms/capacity/details',
			{ params: filters }
		),
	exportClassroomCapacityDetails: (filters: ClassroomCapacityExportFilters) =>
		api.get<Blob>('/analytics/classrooms/capacity/export', {
			params: filters,
			responseType: 'blob',
		}),
	getTechnology: (filters: PeriodCenterFilters) =>
		api.get<IResponse<TechnologySummary>>('/analytics/technology', {
			params: filters,
		}),
	getTechnologyDetails: (filters: TechnologyDetailsFilters) =>
		api.get<IResponse<TechnologyDetails>>('/analytics/technology/details', {
			params: filters,
		}),
	exportTechnologyDetails: (filters: TechnologyExportFilters) =>
		api.get<Blob>('/analytics/technology/export', {
			params: filters,
			responseType: 'blob',
		}),
	getStaff: (filters: StaffFilters) =>
		api.get<IResponse<StaffSummary>>('/analytics/staff', { params: filters }),
	getStaffDetails: (filters: StaffDetailsFilters) =>
		api.get<IResponse<StaffDetails>>('/analytics/staff/details', {
			params: filters,
		}),
	exportStaff: (filters: StaffExportFilters) =>
		api.get<Blob>('/analytics/staff/export', {
			params: filters,
			responseType: 'blob',
		}),
	getActivities: (filters: ActivityFilters) =>
		api.get<IResponse<ActivitySummary>>('/analytics/activities', {
			params: filters,
		}),
	getActivityDetails: (filters: ActivityDetailsFilters) =>
		api.get<IResponse<ActivityDetails>>('/analytics/activities/details', {
			params: filters,
		}),
	exportActivities: (filters: ActivityExportFilters) =>
		api.get<Blob>('/analytics/activities/export', {
			params: filters,
			responseType: 'blob',
		}),
	getMonitoring: (filters: MonitoringFilters) =>
		api.get<IResponse<MonitoringSummary>>('/analytics/monitoring', {
			params: filters,
		}),
	getMonitoringDetails: (filters: MonitoringDetailsFilters) =>
		api.get<IResponse<MonitoringDetails>>('/analytics/monitoring/details', {
			params: filters,
		}),
	exportMonitoring: (filters: MonitoringExportFilters) =>
		api.get<Blob>('/analytics/monitoring/export', {
			params: filters,
			responseType: 'blob',
		}),
};
