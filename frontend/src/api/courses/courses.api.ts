import { api } from '@config';
import { ICreateCourse, IUpdateCourse } from './courses.interfaces';
import { IResponse } from '@shared';
import {
	TCourse,
	TCourseBasicInfo,
	TCourseClassroom,
	TCourseStadistic,
	TCourseStadisticOmit,
	TCourseWithDepartment,
} from './courses.types';
import { TCenterDepartment } from '../centers';
import { TAcademicCommonProps } from '../periods/periods.types';

// Clases
export const coursesApi = {
	getAllCourses: (
		searchTerm: string,
		page: number = 1,
		size: number = 25
	) => {
		const params = new URLSearchParams({
			searchTerm,
			page: String(page),
			size: String(size),
		});

		return api.get<IResponse<TCourse[]>>(`/courses/search?${params}`);
	},

	getCourseById: (id: string) =>
		api.get<IResponse<TCourseWithDepartment>>(`/courses/${id}`),

	searchCourse: (
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
	getAllCoursesByPeriodIdAndCenter: (
		periodId: string,
		centerDepartmentId: string
	) =>
		api.get<
			IResponse<
				(TCourseClassroom & {
					teacher: {
						id: string;
						userId: string;
						name: string;
						code: string;
					};
					centerDepartment: TCenterDepartment & {
						center: Pick<TAcademicCommonProps, 'name'>;
						department: Pick<TAcademicCommonProps, 'name'>;
						coordinator: Pick<TAcademicCommonProps, 'name'>;
					};
				})[]
			>
		>(
			`/course-classrooms/coordinator/center-department/${centerDepartmentId}/periods/${periodId}`
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
	updateCourseStadistic: (
		courseClassroomId: string,
		body: TCourseStadisticOmit
	) =>
		api.patch<IResponse<TCourseStadistic>>(
			`/course-stadistics/${courseClassroomId}`,
			body
		),
};
