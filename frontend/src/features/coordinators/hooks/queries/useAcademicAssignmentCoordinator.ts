import { useQuery } from '@tanstack/react-query';
import { STALE_TIME } from '@lib/tanstack/query-client';
import { academicAssignmentReportsCoordinatorApi } from '@features/coordinators/api';
import { academicAssignmentCoordinatorKeys } from '@features/coordinators/constants';
import { usePaginationParams } from '@hooks';

export const useGetAllAcademicAssignmentCoordinator = () =>
	useQuery({
		queryKey: academicAssignmentCoordinatorKeys.all,
		queryFn: academicAssignmentReportsCoordinatorApi.getAcademicAssignment,
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
			academicAssignmentReportsCoordinatorApi.getAcademicAssignmentOnlyPeriods(
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
			academicAssignmentReportsCoordinatorApi.getAcademicAssignmentByPeriodIdAndCenter(
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
			academicAssignmentReportsCoordinatorApi.getAcademicAssignmentReportsByCenter(
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

export const useGetCoursesCenterDepartmentBySearchTerm = (
	centerDepartmentId: string,
	searchTerm: string
) => {
	const { page, size } = usePaginationParams();
	return useQuery({
		queryKey: academicAssignmentCoordinatorKeys.searchCenterDepartment(
			centerDepartmentId,
			searchTerm,
			page
		),
		queryFn: () =>
			academicAssignmentReportsCoordinatorApi.getCoursesCenterDepartmentBySearchTerm(
				centerDepartmentId,
				searchTerm,
				page,
				size
			),
		enabled: searchTerm.length >= 2,
		staleTime: STALE_TIME.SHORT,
		select: res => res.data,
	});
};
