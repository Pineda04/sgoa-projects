import { TCenterDepartment } from '@features/centers';
import { TAcademicCommonProps, TCourseClassroom } from '@features/teachers';
import { TOutputTeacher } from '@features/teachers/types/teacher.types';
import { api } from '@lib/api/axios';
import { IResponse } from '@types';
import { TCoordination } from '../types';

export const coordinatorsApi = {
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

	getAllTeachersCoordinator: (
		page: number,
		size: number,
		centerDepartmentId: string
	) =>
		api.get<IResponse<TOutputTeacher[]>>(
			`/teachers/coordinator/center-department/${centerDepartmentId}?page=${page}&size=${size}`
		),

	getAllMyCoordinations: () =>
		api.get<IResponse<TCoordination[]>>(
			`/teacher-department-position/my/coordinations`
		),

	// Delete and Update CourseClassroom
	deleteCourseClassroom: (id: string) =>
		api.delete<IResponse<boolean>>(`course-classrooms/${id}`),

	changeTeacherCourseClassroom: (
		courseClassroomId: string,
		teacherId: string
	) =>
		api.patch<IResponse<boolean>>(
			`course-classrooms/${courseClassroomId}/${teacherId}`
		),
};
