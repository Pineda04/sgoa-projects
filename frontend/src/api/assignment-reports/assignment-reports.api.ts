import { api } from '@config/lib';
import { IResponse } from '@shared';
import { TAssignmentReport, TPlanification, TPlanificationWithErrors } from "./assignment-reports.types";
import { TCurrentAcademicPeriod, TPacData } from "../periods/periods.types";

export const academicAssignmentReportsApi = {
	createAcademicAssignment: (
		centerDepartmentId: string,
		formData: FormData
	) =>
		api.post(`/academic-assignment-reports/file/coordinator/${centerDepartmentId}`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		}),

	createAcademicAssignmentArray: (
		centerDepartmentId: string,
		assignments: TPlanification[]
	) =>
		api.post<
			IResponse<{
				courses: TPlanification[];
				invalidElements: TPlanificationWithErrors[];
			}>
		>(`/academic-assignment-reports/array/coordinator/${centerDepartmentId}`, {
			assignments,
		}),

	getAcademicAssignmentArray: (
		centerDepartmentId: string,
		formData: FormData
	) =>
		api.post<
			IResponse<{
				pacId: string;
				pac: number;
				year: number;
				pac_modality: string;
				title: string;
				courses: TPlanification[];
				invalidElements: TPlanificationWithErrors[];
			}>
		>(`/academic-assignment-reports/file/coordinator/view/${centerDepartmentId}`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		}),

	getAcademicAssignment: () =>
		api.get<IResponse<TAssignmentReport[]>>(`/academic-assignment-reports/coordinator`),

	getAcademicAssignmentOnlyPeriods: (
		page: number = 1,
		size: number = 10,
		centerDepartmentId: string
	) =>
		api.get<
			IResponse<
				(TCurrentAcademicPeriod & { centerDepartmentId: string })[]
			>
		>(
			`/academic-assignment-reports/coordinator/${centerDepartmentId}/periods?page=${page}&size=${size}`
		),

	// WARNING: No usar este.
	getAcademicAssignmentByPeriodIdAndCenter: (
		periodId: string,
		centerDepartmentId: string
	) =>
		api.get<IResponse<TAssignmentReport[]>>(
			`/academic-assignment-reports/coordinator/${centerDepartmentId}/periods/${periodId}`
		),

	getAcademicAssignmentReportsByCenter: (
		centerDepartmentId: string,
		periodId?: string,
		teacherId?: string,
		page: number = 1,
		size: number = 25
	) =>
		api.get<IResponse<TAssignmentReport[]>>(
			`/academic-assignment-reports/departments/${centerDepartmentId}?${
				periodId ? 'periodId=' + periodId : ''
			}${
				teacherId ? '&teacherId=' + teacherId : ''
			}&page=${page}&size=${size}`
    ),

		getAllAcademicAssignmentReportsOnlyPeriods: () =>
			api.get<
				IResponse<
					(TPacData & {
						centerDepartmentId: string;
						center: string;
						department: string;
						reportId: string; // academicAssignmentReportId
					})[]
				>
			>(`/academic-assignment-reports/periods`),

		getAcademicAssignmentReportById: (reportId: string) =>
			api.get<IResponse<TAssignmentReport>>(
				`/academic-assignment-reports/${reportId}`
			),

		getAcademicAssignmentWithPeriodIdAndCenterDepartment: (
			periodId: string,
			centerDepartmentId: string
		) =>
			api.get<IResponse<TAssignmentReport>>(
				`/academic-assignment-reports/my/period/${periodId}/center-department/${centerDepartmentId}`
			),
};
