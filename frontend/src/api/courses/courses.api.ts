import { api } from '@config';
import { ICreateCourse, IUpdateCourse, IUpdateCourseClassroom } from './courses.interfaces';
import { IResponse } from '@shared';
import {
	TCourse,
	TCourseBasicInfo,
	TCourseClassroom,
	TCourseClassroomDetail,
	TCourseStadistic,
	TCourseStadisticOmit,
	TCourseWithDepartment,
} from './courses.types';
import { TCenterDepartment } from '../centers';
import { TAcademicCommonProps } from '../periods/periods.types';
import { TOutputConsolidated } from './courses.types';

// Clases
export const coursesApi = {
	getAllCourses: (
		searchTerm: string,
		page: number = 1,
		size: number = 25,
		activeStatus?: boolean
	) => {
		const params = new URLSearchParams({
			searchTerm,
			page: String(page),
			size: String(size),
		});
		if (activeStatus !== undefined) params.set('activeStatus', String(activeStatus));

		return api.get<IResponse<TCourse[]>>(`/courses/search?${params}`);
	},

	getCourseById: (id: string) =>
		api.get<IResponse<TCourseWithDepartment>>(`/courses/${id}`),

	searchCourse: (
		centerDepartmentId: string,
		searchTerm: string,
		page: number = 1,
		size: number = 25,
		activeStatus?: boolean
	) => {
		const params = new URLSearchParams({
			searchTerm,
			page: String(page),
			size: String(size),
		});
		if (activeStatus !== undefined) params.set('activeStatus', String(activeStatus));

		return api.get<IResponse<TCourse[]>>(
			`/courses/search/${centerDepartmentId}?${params}`
		);
	},

	searchAllCourses: (
		searchTerm: string,
		page: number = 1,
		size: number = 50
	) =>
		api.get<IResponse<TCourse[]>>(
			`/courses/search?searchTerm=${searchTerm}&page=${page}&size=${size}`
		),

	createCourse: (data: ICreateCourse) =>
		api.post<IResponse<TCourse>>(`/courses`, data),

	updateCourse: (id: string, data: IUpdateCourse) =>
		api.patch<IResponse<TCourse>>(`/courses/${id}`, data),

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

// Secciones
export const courseClassroomsApi = {

	getAllCoursesByRoleAndPeriod: (
		role: 'coordinator' | 'authority',
		periodId: string,
		centerDepartmentId: string
	) =>
		api.get<
			IResponse<
				(TCourseClassroom & {
					teacher: { id: string; userId: string; name: string; code: string };
					centerDepartment: TCenterDepartment & {
						center: Pick<TAcademicCommonProps, 'name'>;
						department: Pick<TAcademicCommonProps, 'name'>;
						coordinator: Pick<TAcademicCommonProps, 'name'>;
					};
				})[]
			>
		>(
			`/course-classrooms/${role}/center-department/${centerDepartmentId}/periods/${periodId}`
			/* Esta URL podria llegar a tener los siguientes valores de URL:
				/course-classrooms/coordinator/center-department/${centerDepartmentId}/periods/${periodId}
				/course-classrooms/authority/center-department/${centerDepartmentId}/periods/${periodId}
			*/
		),

	getAllByCenterDepartment: (centerDepartmentId: string, periodId: string) =>
		api.get<IResponse<TCourseClassroom[]>>(
			`/course-classrooms/coordinator/center-department/${centerDepartmentId}/periods/${periodId}`
		),

	getAll: () =>
		api.get<IResponse<TCourseClassroom[]>>(`/course-classrooms/all`),

	getByTeacher: (teacherId: string) =>
		api.get<IResponse<TCourseClassroom[]>>(
			`/course-classrooms/teacher/${teacherId}`
		),

	getCourseClassroomById: (id: string) =>
		api.get<IResponse<TCourseClassroomDetail>>(`/course-classrooms/${id}`),

	updateCourseClassroom: (id: string, data: IUpdateCourseClassroom) =>
		api.patch<IResponse<TCourseClassroom>>(`/course-classrooms/${id}`, data),

	changeTeacherCourseClassroom: (
		courseClassroomId: string,
		teacherId: string
	) =>
		api.patch<IResponse<boolean>>(
			`/course-classrooms/${courseClassroomId}/${teacherId}`
		),

	deleteCourseClassroom: (id: string) =>
		api.delete<IResponse<boolean>>(`/course-classrooms/${id}`),

	getCurrentUserCourses: () =>
		api.get<IResponse<TCourseClassroom[]>>(
			`/course-classrooms/my/current-period`
		),
};

// Estadisticas
export const courseStadisticsApi = {
	getConsolidated: (params: {
		year?: string;
		pac?: string;
		centerDepartmentId?: string;
		page?: number;
		size?: number;
		searchTerm?: string;
	}) => {
		const searchParams = new URLSearchParams();
		if (params.year) searchParams.set('year', params.year);
		if (params.pac) searchParams.set('pac', params.pac);
		if (params.centerDepartmentId)
			searchParams.set('centerDepartmentId', params.centerDepartmentId);
		if (params.page) searchParams.set('page', String(params.page));
		if (params.size) searchParams.set('size', String(params.size));
		if (params.searchTerm) searchParams.set('searchTerm', params.searchTerm);
		return api.get<IResponse<TOutputConsolidated[]>>(
			`/course-stadistics/consolidated?${searchParams}`
		);
	},

	updateCourseStadistic: (
		courseClassroomId: string,
		body: TCourseStadisticOmit
	) =>
		api.patch<IResponse<TCourseStadistic>>(
			`/course-stadistics/${courseClassroomId}`,
			body
		),
};
