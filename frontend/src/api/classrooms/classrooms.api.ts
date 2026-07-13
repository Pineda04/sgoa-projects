import { api } from '@config';
import { IResponse } from '@shared';
import {
	TClassroom,
	TClassroomSearch,
	TCreateClassroom,
	TUpdateClassroom,
} from './classrooms.types';

export const classroomsApi = {
	getAllClassrooms: (
		page: number,
		size: number,
		filters?: { name?: string; buildingId?: string; roomTypeId?: string; activeStatus?: string }
	) => {
		const params = new URLSearchParams({ page: String(page), size: String(size) });
		if (filters?.name) params.set('name', filters.name);
		if (filters?.buildingId) params.set('buildingId', filters.buildingId);
		if (filters?.roomTypeId) params.set('roomTypeId', filters.roomTypeId);
		if (filters?.activeStatus) params.set('activeStatus', filters.activeStatus);
		return api.get<IResponse<TClassroom[]>>(`/classrooms?${params.toString()}`);
	},

	getClassroomsBySearchTerm: (
		searchTerm: string,
		page: number = 1,
		size: number = 50
	) =>
		api.get<IResponse<TClassroomSearch[]>>(
			`/classrooms/search?searchTerm=${encodeURIComponent(searchTerm)}&page=${page}&size=${size}`
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
