import { api } from '@config';
import { IResponse } from '@shared';
import {
	TClassroom,
	TClassroomSearch,
	TCreateClassroom,
	TUpdateClassroom,
} from './classrooms.types';

export const classroomsApi = {
	getAllClassrooms: (page: number, size: number) =>
		api.get<IResponse<TClassroom[]>>(`/classrooms?page=${page}&size=${size}`),

	getClassroomsBySearchTerm: (
		searchTerm: string,
		page: number = 1,
		size: number = 50
	) =>
		api.get<IResponse<TClassroomSearch[]>>(
			`/classrooms/search?searchTerm=${searchTerm}&page=${page}&size=${size}`
		),

	getClassroomById: (id: string) =>
		api.get<IResponse<TClassroom>>(`/classrooms/${id}`),

	createClassroom: (body: TCreateClassroom) =>
		api.post<IResponse<TClassroom>>(`/classrooms`, body),

	updateClassroom: ({ id, body }: { id: string; body: TUpdateClassroom }) =>
		api.patch<IResponse<TClassroom>>(`/classrooms/${id}`, body),

	deleteClassroom: (id: string) =>
		api.delete<IResponse<TClassroom>>(`/classrooms/${id}`),
};
