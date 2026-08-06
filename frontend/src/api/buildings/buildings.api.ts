import { api } from '@config';
import { IResponse } from '@shared';
import { TBuilding, TCreateBuilding, TUpdateBuilding } from './buildings.types';

export const buildingsApi = {
	getAllBuildings: () => api.get<IResponse<TBuilding[]>>('/buildings'),

	getBuildingById: (id: string) =>
		api.get<IResponse<TBuilding>>(`/buildings/${id}`),

	createBuilding: (body: TCreateBuilding) =>
		api.post<IResponse<TBuilding>>('/buildings', body),

	updateBuilding: (id: string, body: TUpdateBuilding) =>
		api.patch<IResponse<TBuilding>>(`/buildings/${id}`, body),

	deleteBuilding: (id: string) =>
		api.delete<IResponse<void>>(`/buildings/${id}`),
};
