import { TOutputTeacherPosition } from '@features/teachers/types/teacher.types';
import { api } from '@lib/api/axios';
import { IResponse } from '@types';
import { TCreateUser, TUpdateUser } from '../schemas';
import { TTeacherBasicInfo } from '../types';

export const usersApi = {
	createUser: (body: TCreateUser) =>
		api.post<IResponse<TOutputTeacherPosition>>(`/users`, body),

	// Los 'teachers' terminan siendo usuarios, por lo que es mejor segmentarlos acá
	getAllTeachers: (page: number, size: number) =>
		api.get<IResponse<TOutputTeacherPosition[]>>(
			`/teachers?page=${page}&size=${size}`
		),

	getOneTeacher: (id: string) =>
		api.get<IResponse<TOutputTeacherPosition>>(`/teachers/${id}`),

	// Search teachers
	getTeachersBySearchTerm: (
		searchTerm: string,
		page: number = 1,
		size: number = 50
	) =>
		api.get<IResponse<TTeacherBasicInfo[]>>(
			`/teachers/search?searchTerm=${searchTerm}&page=${page}&size=${size}`
		),

	updateUser: ({ body }: { body: TUpdateUser }) =>
		api.patch(`/users/my`, body),

	updateUserOther: ({
		userId,
		body,
	}: {
		userId?: string;
		body: TUpdateUser;
	}) => api.patch(`/users/${userId}`, body),

	changeStatusActiveUser: (teacherId: string) =>
		api.delete(`/teachers/${teacherId}`),
};
