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

	getAcademicAssignmentTemplate: () =>
		api.get('/academic-assignment-reports/template', {
			responseType: 'blob',
		}),

	getAcademicAssignmentOnlyPeriods: (
		page: number = 1,
		size: number = 10,
		centerDepartmentId: string,
		year?: string,
		pac?: string
	) => {
		const params = new URLSearchParams({
			page: String(page),
			size: String(size),
		});
		if (year) params.set('year', year);
		if (pac) params.set('pac', pac);
		return api.get<
			IResponse<
				(TCurrentAcademicPeriod & { centerDepartmentId: string })[]
			>
		>(
			`/academic-assignment-reports/coordinator/${centerDepartmentId}/periods?${params}`
		);
	},

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
		size: number = 25,
		year?: string,
		pac?: string,
		teacherName?: string
	) => {
		const params = new URLSearchParams({
			page: String(page),
			size: String(size),
		});
		if (periodId) params.set('periodId', periodId);
		if (teacherId) params.set('teacherId', teacherId);
		if (year) params.set('year', year);
		if (pac) params.set('pac', pac);
		if (teacherName) params.set('teacherName', teacherName);
		return api.get<IResponse<TAssignmentReport[]>>(
			`/academic-assignment-reports/departments/${centerDepartmentId}?${params}`
		);
	},

	// Todos los periodos con asignaciones (todos los centros y departamentos)
	getAllPeriodsForAuthorities: (
		page: number = 1,
		size: number = 10,
		year?: string,
		pac?: string,
		departmentId?: string,
		centerId?: string
	) => {
		const params = new URLSearchParams({
			page: String(page),
			size: String(size),
		});
		if (year) params.set('year', year);
		if (pac) params.set('pac', pac);
		if (departmentId) params.set('departmentId', departmentId);
		if (centerId) params.set('centerId', centerId);
		return api.get<
			IResponse<
				(TCurrentAcademicPeriod & {
					centerDepartmentId: string;
					centerName: string;
					departmentName: string;
				})[]
			>
		>(`/academic-assignment-reports/periods/all?${params}`);
	},

	// Todos los informes de asignación académica — para ADMIN, DIRECCION, RRHH
	getAllAssignmentReports: (
		page: number = 1,
		size: number = 25,
		year?: string,
		pac?: string,
		departmentId?: string,
		centerId?: string,
		teacherName?: string
	) => {
		const params = new URLSearchParams({
			page: String(page),
			size: String(size),
		});
		if (year) params.set('year', year);
		if (pac) params.set('pac', pac);
		if (departmentId) params.set('departmentId', departmentId);
		if (centerId) params.set('centerId', centerId);
		if (teacherName) params.set('teacherName', teacherName);
		return api.get<IResponse<TAssignmentReport[]>>(
			`/academic-assignment-reports?${params}`
		);
	},

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
