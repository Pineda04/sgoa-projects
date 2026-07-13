import { api } from '@config/lib';
import { IResponse } from '@shared/interfaces';
import { TConnectivity } from './connectivities.types';

export const connectivitiesApi = {
	getAllConnectivities: () =>
		api.get<IResponse<TConnectivity[]>>(`/connectivities`),
};
