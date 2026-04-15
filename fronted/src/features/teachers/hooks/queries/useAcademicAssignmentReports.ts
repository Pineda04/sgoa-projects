import { useQuery } from '@tanstack/react-query';
import { STALE_TIME } from '@lib/tanstack/query-client';
import { academicAssignmentReportsTeacherApi } from '@features/teachers/api';
import { academicAssignmentReportKeys } from '@features/teachers/constants';

// export const useGetAllAcademicAssignmentReports = () =>
// 	useQuery({
// 		queryKey: academicAssignmentReportKeys.all,
// 		queryFn:
// 			academicAssignmentReportsTeacherApi.getAllAcademicAssignmentReportsOnlyPeriods,
// 		retry: false,
// 		refetchOnWindowFocus: false,
// 		select: res => res.data.data,
// 	});

export const useGetAcademicAssignmentReportsPeriods = () =>
	useQuery({
		queryKey: academicAssignmentReportKeys.periods(),
		queryFn:
			academicAssignmentReportsTeacherApi.getAllAcademicAssignmentReportsOnlyPeriods,
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.LONG,
		select: res => res.data.data,
	});

// export const useGetAcademicAssignmentReportByPeriod = (periodId?: string) =>
// 	useQuery({
// 		queryKey: academicAssignmentReportKeys.period(periodId ?? ''),
// 		queryFn: () =>
// 			academicAssignmentReportsTeacherApi.getAcademicAssignmentWithPeriodId(
// 				periodId!
// 			),
// 		enabled: Boolean(periodId),
// 		retry: false,
// 		refetchOnWindowFocus: false,
// 		select: res => res.data.data,
// 	});

export const useGetAcademicAssignmentReportById = (reportId?: string) =>
	useQuery({
		queryKey: academicAssignmentReportKeys.report(reportId ?? ''),
		queryFn: () =>
			academicAssignmentReportsTeacherApi.getAcademicAssignmentReportById(
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
		queryKey: academicAssignmentReportKeys.periodCenter(
			periodId ?? '',
			centerDepartmentId ?? ''
		),
		queryFn: () =>
			academicAssignmentReportsTeacherApi.getAcademicAssignmentWithPeriodIdAndCenterDepartment(
				periodId!,
				centerDepartmentId!
			),
		enabled: Boolean(periodId && centerDepartmentId),
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.MEDIUM,
		select: res => res.data.data,
	});
