import { api } from '@lib/api/axios';
import { IResponse } from '@types';
import { TClassroom } from '../types';

export const classroomsApi = {
	// Search classrooms
	getClassroomsBySearchTerm: (
		searchTerm: string,
		page: number = 1,
		size: number = 50
	) =>
		api.get<IResponse<TClassroom[]>>(
			`/classrooms/search?searchTerm=${searchTerm}&page=${page}&size=${size}`
		),
};
