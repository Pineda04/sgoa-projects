import {
	TCoordination,
	TOutputTeacher,
	TOutputTeacherPosition,
	TTeacherBasicInfo,
	TTeacherPosition,
	TTeachingSession,
	TTeachingSessionOmit,
} from './teachers.types';
import { TAcademicCommonProps } from '../periods/periods.types';
import { IResponse } from '@shared/interfaces';
import { api } from '@config/lib';

export const teachersApi = {
	getAllTeachers: (
		page: number,
		size: number,
		filters?: { searchTerm?: string; categoryId?: string; contractTypeId?: string }
	) => {
		const params = new URLSearchParams({ page: String(page), size: String(size) });
		if (filters?.searchTerm) params.set('searchTerm', filters.searchTerm);
		if (filters?.categoryId) params.set('categoryId', filters.categoryId);
		if (filters?.contractTypeId) params.set('contractTypeId', filters.contractTypeId);
		return api.get<IResponse<TOutputTeacherPosition[]>>(`/teachers?${params.toString()}`);
	},

	getOneTeacher: (id: string) =>
		api.get<IResponse<TOutputTeacherPosition>>(`/teachers/${id}`),

	getTeachersBySearchTerm: (
		searchTerm: string,
		page: number = 1,
		size: number = 50
	) =>
		api.get<IResponse<TTeacherBasicInfo[]>>(
			`/teachers/search?searchTerm=${searchTerm}&page=${page}&size=${size}`
		),

	getCurrentTeacher: () =>
		api.get<IResponse<TOutputTeacherPosition>>(`/teachers/my`),

	getOneTeacherByUserId: (id: string) =>
		api.get<IResponse<TOutputTeacherPosition>>(`/teachers/teacher/${id}`),

	getAllTeachersCoordinator: (
		page: number,
		size: number,
		centerDepartmentId: string,
		filters?: { searchTerm?: string; categoryId?: string; contractTypeId?: string }
	) => {
		const params = new URLSearchParams({ page: String(page), size: String(size) });
		if (filters?.searchTerm) params.set('searchTerm', filters.searchTerm);
		if (filters?.categoryId) params.set('categoryId', filters.categoryId);
		if (filters?.contractTypeId) params.set('contractTypeId', filters.contractTypeId);
		return api.get<IResponse<TOutputTeacher[]>>(
			`/teachers/coordinator/center-department/${centerDepartmentId}?${params.toString()}`
		);
	},

	changeStatusActiveTeacherUser: (teacherId: string) =>
		api.delete(`/teachers/${teacherId}`),
};

export const teacherDepartmentPositionApi = {
	getTeacherPosition: (centerDepartmentId: string) =>
		api.get<IResponse<TTeacherPosition>>(
			`/teacher-department-position/my/center-department/${centerDepartmentId}`
		),

	getAllMyCoordinations: () =>
		api.get<IResponse<TCoordination[]>>(
			`/teacher-department-position/my/coordinations`
		),
};

export const teacherCategoriesApi = {
	getAllTeacherCategories: () =>
    api.get<IResponse<TAcademicCommonProps[]>>(`/teacher-categories`),

  createTeacherCategory: (body: { name: string }) =>
		api.post<IResponse<TAcademicCommonProps>>(`/teacher-categories`, body),

	updateTeacherCategory: ({ id, body }: { id: string; body: { name: string } }) =>
		api.patch<IResponse<TAcademicCommonProps>>(`/teacher-categories/${id}`, body),

	deleteTeacherCategory: (id: string) =>
		api.delete<IResponse<void>>(`/teacher-categories/${id}`),
};

export const teachingSessionsApi = {
	updateTeachingSession: (
		teachingSessionId: string,
		body: TTeachingSessionOmit
	) =>
		api.patch<IResponse<Omit<TTeachingSession, 'courseClassrooms'>>>(
			`/teaching-sessions/${teachingSessionId}`,
			body
		),
};
