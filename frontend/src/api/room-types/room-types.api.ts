import { api } from '@config/lib';
import { IResponse } from '@shared/interfaces';
import { TRoomType } from './room-types.types';

export const roomTypesApi = {
	getAllRoomTypes: () => api.get<IResponse<TRoomType[]>>(`/room-types`),
};
