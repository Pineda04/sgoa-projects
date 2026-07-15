import { api } from '@config/lib';
import { IResponse } from '@shared/interfaces';
import {
	TAirConditioner,
	TCreateAirConditioner,
	TUpdateAirConditioner,
} from './air-conditioners.types';

export const airConditionersApi = {
	getAllAirConditioners: () =>
		api.get<IResponse<TAirConditioner[]>>(`/air-conditioners`),

	getOneAirConditioner: (id: string) =>
		api.get<IResponse<TAirConditioner>>(`/air-conditioners/${id}`),

	createAirConditioner: (body: TCreateAirConditioner) =>
		api.post<IResponse<TAirConditioner>>(`/air-conditioners`, body),

	updateAirConditioner: ({
		id,
		body,
	}: {
		id: string;
		body: TUpdateAirConditioner;
	}) =>
		api.patch<IResponse<TAirConditioner>>(`/air-conditioners/${id}`, body),

	deleteAirConditioner: (id: string) =>
		api.delete<IResponse<TAirConditioner>>(`/air-conditioners/${id}`),
};
