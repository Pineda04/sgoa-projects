import { TAssignmentReport, TCurrentAcademicPeriod } from '@features/teachers';
import { api } from '@lib/api/axios';
import { IResponse } from '@types';
import {
	TPlanification,
	TPlanificationWithErrors,
} from '../schemas/planification.schemas';
import { TCourseBasicInfo } from '../types';

const path = 'academic-assignment-reports';

export const academicAssignmentReportsCoordinatorApi = {
	// Crear Planificación o asignación académica
	createAcademicAssignment: (
		centerDepartmentId: string,
		formData: FormData
	) =>
		api.post(`${path}/file/coordinator/${centerDepartmentId}`, formData, {
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
		>(`${path}/array/coordinator/${centerDepartmentId}`, {
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
		>(`${path}/file/coordinator/view/${centerDepartmentId}`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		}),

	getAcademicAssignment: () =>
		api.get<IResponse<TAssignmentReport[]>>(`${path}/coordinator`),

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
			`${path}/coordinator/${centerDepartmentId}/periods?page=${page}&size=${size}`
		),

	// WARNING: No usar este.
	getAcademicAssignmentByPeriodIdAndCenter: (
		periodId: string,
		centerDepartmentId: string
	) =>
		api.get<IResponse<TAssignmentReport[]>>(
			`${path}/coordinator/${centerDepartmentId}/periods/${periodId}`
		),

	getAcademicAssignmentReportsByCenter: (
		centerDepartmentId: string,
		periodId?: string,
		teacherId?: string,
		page: number = 1,
		size: number = 25
	) =>
		api.get<IResponse<TAssignmentReport[]>>(
			`${path}/departments/${centerDepartmentId}?${
				periodId ? 'periodId=' + periodId : ''
			}${
				teacherId ? '&teacherId=' + teacherId : ''
			}&page=${page}&size=${size}`
		),

	// Search courses
	getCoursesCenterDepartmentBySearchTerm: (
		centerDepartmentId: string,
		searchTerm: string,
		page: number = 1,
		size: number = 50
	) =>
		api.get<IResponse<TCourseBasicInfo[]>>(
			`/courses/search/${centerDepartmentId}?searchTerm=${searchTerm}&page=${page}&size=${size}`
		),
};
