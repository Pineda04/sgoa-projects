import { api } from '@lib/api/axios';
import { IResponse } from '@types';
import type {
	TCourseClassroom,
	TCourse,
	TCourseWithDepartment,
} from '@features/teachers';

const CLASSROOMS_BASE = '/course-classrooms';
const COURSES_BASE = '/courses';

export const courseClassroomsApi = {
	getAllByCenterDepartment: (centerDepartmentId: string, periodId: string) =>
		api.get<IResponse<TCourseClassroom[]>>(
			`${CLASSROOMS_BASE}/coordinator/center-department/${centerDepartmentId}/periods/${periodId}`
		),

	getAll: () =>
		api.get<IResponse<TCourseClassroom[]>>(`${CLASSROOMS_BASE}/all`),

	getByTeacher: (teacherId: string) =>
		api.get<IResponse<TCourseClassroom[]>>(
			`${CLASSROOMS_BASE}/teacher/${teacherId}`
		),
};

export const coursesApi = {
	getAll: (searchTerm: string, page: number = 1, size: number = 25) => {
		const params = new URLSearchParams({
			searchTerm,
			page: String(page),
			size: String(size),
		});

		return api.get<IResponse<TCourse[]>>(
			`${COURSES_BASE}/search?${params}`
		);
	},

	getById: (id: string) =>
		api.get<IResponse<TCourseWithDepartment>>(`${COURSES_BASE}/${id}`),

	search: (
		centerDepartmentId: string,
		searchTerm: string,
		page: number = 1,
		size: number = 25
	) => {
		const params = new URLSearchParams({
			searchTerm,
			page: String(page),
			size: String(size),
		});

		// console.info(`${COURSES_BASE}/search/${centerDepartmentId}?${params}`);

		// const url = centerDepartmentId
		// 	? `${COURSES_BASE}/search/${centerDepartmentId}?${params}`
		// 	: `${COURSES_BASE}/search?${params}`;

		return api.get<IResponse<TCourse[]>>(
			`${COURSES_BASE}/search/${centerDepartmentId}?${params}`
		);
	},

	searchAll: (searchTerm: string, page: number = 1, size: number = 50) =>
		api.get<IResponse<TCourse[]>>(
			`${COURSES_BASE}/search?searchTerm=${searchTerm}&page=${page}&size=${size}`
		),

	create: (data: CreateCourseDto) =>
		api.post<IResponse<TCourse>>(`${COURSES_BASE}`, data),

	update: (id: string, data: UpdateCourseDto) =>
		api.patch<IResponse<TCourse>>(`${COURSES_BASE}/${id}`, data),
};

export interface CreateCourseDto {
	name: string;
	code: string;
	uvs: number;
	activeStatus: boolean;
	departmentId: string;
}

export interface UpdateCourseDto {
	name?: string;
	code?: string;
	uvs?: number;
	activeStatus?: boolean;
	departmentId?: string;
}
