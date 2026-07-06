import { useQuery } from '@tanstack/react-query';
import { academicAssignmentAuthoritiesKeys, academicAssignmentCoordinatorKeys, academicAssignmentReportsKeys } from './assignment-reports.keys';
import { STALE_TIME } from '@config';
import { usePaginationParams } from '@shared';
import { academicAssignmentReportsApi } from './assignment-reports.api';

export const useGetAcademicAssignmentReportsPeriods = () =>
	useQuery({
		queryKey: academicAssignmentReportsKeys.periods(),
		queryFn:
			academicAssignmentReportsApi.getAllAcademicAssignmentReportsOnlyPeriods,
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.LONG,
		select: res => res.data.data,
	});

export const useGetAcademicAssignmentReportById = (reportId?: string) =>
	useQuery({
		queryKey: academicAssignmentReportsKeys.report(reportId ?? ''),
		queryFn: () =>
			academicAssignmentReportsApi.getAcademicAssignmentReportById(
				reportId!
			),
		enabled: Boolean(reportId),
		staleTime: STALE_TIME.MEDIUM,
		select: res => res.data.data,
	});

export const useGetAcademicAssignmentReportByPeriodAndCenterDepartment = (
	periodId?: string,
	centerDepartmentId?: string
) =>
	useQuery({
		queryKey: academicAssignmentReportsKeys.periodCenter(
			periodId ?? '',
			centerDepartmentId ?? ''
		),
		queryFn: () =>
			academicAssignmentReportsApi.getAcademicAssignmentWithPeriodIdAndCenterDepartment(
				periodId!,
				centerDepartmentId!
			),
		enabled: Boolean(periodId && centerDepartmentId),
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.MEDIUM,
		select: res => res.data.data,
	});

export const useGetAllAcademicAssignmentCoordinator = () =>
	useQuery({
		queryKey: academicAssignmentCoordinatorKeys.all,
		queryFn: academicAssignmentReportsApi.getAcademicAssignment,
		staleTime: STALE_TIME.MEDIUM,
		select: res => res.data.data,
	});

export const useGetAcademicAssignmentCoordinatorOnlyPeriods = (
	centerDepartmentId?: string
) => {
	const { page, size } = usePaginationParams();

	return useQuery({
		queryKey: academicAssignmentCoordinatorKeys.periodPageCenter(
			page,
			centerDepartmentId ?? ''
		),
		queryFn: () =>
			academicAssignmentReportsApi.getAcademicAssignmentOnlyPeriods(
				page,
				size,
				centerDepartmentId ?? ''
			),
		enabled:
			centerDepartmentId === '' ? false : Boolean(centerDepartmentId),
		staleTime: STALE_TIME.MEDIUM,
		select: res => res.data,
	});
};

// WARNING: No usar este.
export const useGetAcademicAssignmentCoordinatorByPeriodAndCenter = (
	periodId?: string,
	centerDepartmentId?: string
) =>
	useQuery({
		queryKey: academicAssignmentCoordinatorKeys.periodCenter(
			periodId ?? '',
			centerDepartmentId ?? ''
		),
		queryFn: () =>
			academicAssignmentReportsApi.getAcademicAssignmentByPeriodIdAndCenter(
				periodId!,
				centerDepartmentId!
			),
		enabled: Boolean(periodId && centerDepartmentId),
		staleTime: STALE_TIME.MEDIUM,
		select: res => res.data.data,
	});

export const useGetAcademicAssignmentReportsCoordinatorByCenter = (
	centerDepartmentId: string,
	periodId?: string,
	teacherId?: string
) => {
	const { page, size } = usePaginationParams();

	return useQuery({
		queryKey: academicAssignmentCoordinatorKeys.periodCenterTeacher(
			periodId ?? '',
			centerDepartmentId,
			teacherId ?? 'all'
		),
		queryFn: () =>
			academicAssignmentReportsApi.getAcademicAssignmentReportsByCenter(
				centerDepartmentId,
				periodId,
				teacherId,
				page,
				size
			),
		enabled: Boolean(centerDepartmentId),
		staleTime: STALE_TIME.MEDIUM,
		select: res => res.data,
	});
};

// Hook para obtener todos los periodos con asignaciones (ADMIN, DIRECCION, RRHH)
export const useGetAllPeriodsForAuthorities = () => {
	const { page, size } = usePaginationParams();

	return useQuery({
		queryKey: academicAssignmentAuthoritiesKeys.periods(page, size),
		queryFn: () =>
			academicAssignmentReportsApi.getAllPeriodsForAuthorities(page, size),
		staleTime: STALE_TIME.MEDIUM,
		select: res => res.data,
	});
};

// Hook para obtener todos los informes de asignación (ADMIN, DIRECCION, RRHH)
export const useGetAllAssignmentReportsForAuthorities = () => {
	const { page, size } = usePaginationParams();

	return useQuery({
		queryKey: academicAssignmentAuthoritiesKeys.reports(page, size),
		queryFn: () =>
			academicAssignmentReportsApi.getAllAssignmentReports(page, size),
		staleTime: STALE_TIME.MEDIUM,
		select: res => res.data,
	});
};
