import { api } from '@lib/api/axios';
import { IResponse } from '@types';
import {
	TOutputTeacherPosition,
	TTeacherPosition,
} from '../types/teacher.types';

export const teachersApi = {
	getCurrentTeacher: () =>
		api.get<IResponse<TOutputTeacherPosition>>(`/teachers/my`),

	// Position
	getTeacherPosition: (centerDepartmentId: string) =>
		api.get<IResponse<TTeacherPosition>>(
			`/teacher-department-position/my/center-department/${centerDepartmentId}`
		),

	getOneTeacherByUserId: (id: string) =>
		api.get<IResponse<TOutputTeacherPosition>>(`/teachers/teacher/${id}`),
};
