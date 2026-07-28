import { api } from '@config/lib';
import { IResponse } from '@shared/interfaces';
import { TConnectivity } from './connectivities.types';

export const connectivitiesApi = {
	getAllConnectivities: () =>
		api.get<IResponse<TConnectivity[]>>(`/connectivities`),

	createConnectivity: (body: { description: string }) =>
		api.post<IResponse<TConnectivity>>(`/connectivities`, body),

	updateConnectivity: ({
		id,
		body,
	}: {
		id: string;
		body: { description: string };
	}) => api.patch<IResponse<TConnectivity>>(`/connectivities/${id}`, body),

	deleteConnectivity: (id: string) =>
		api.delete<IResponse<void>>(`/connectivities/${id}`),
};
