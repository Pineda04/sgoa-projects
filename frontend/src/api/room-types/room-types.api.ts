import { api } from '@config/lib';
import { IResponse } from '@shared/interfaces';
import { TRoomType } from './room-types.types';

export const roomTypesApi = {
	getAllRoomTypes: () => api.get<IResponse<TRoomType[]>>(`/room-types`),

	createRoomType: (body: { description: string }) =>
		api.post<IResponse<TRoomType>>(`/room-types`, body),

	updateRoomType: ({ id, body }: { id: string; body: { description: string } }) =>
		api.patch<IResponse<TRoomType>>(`/room-types/${id}`, body),

	deleteRoomType: (id: string) =>
		api.delete<IResponse<void>>(`/room-types/${id}`),
};
