import { api } from '@config';
import { IResponse } from '@shared';
import { TClassroom } from './classrooms.types';

export const classroomsApi = {
	getClassroomsBySearchTerm: (
		searchTerm: string,
		page: number = 1,
		size: number = 50
	) =>
		api.get<IResponse<TClassroom[]>>(
			`/classrooms/search?searchTerm=${searchTerm}&page=${page}&size=${size}`
		),

	getClassroomById: (id: string) =>
		api.get<IResponse<Omit<TClassroom, 'building'>>>(`/classrooms/${id}`),
};
