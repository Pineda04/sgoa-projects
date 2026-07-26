import { api } from '@config/lib';
import { IResponse } from '@shared/interfaces';
import { TCondition } from './conditions.types';

export const conditionsApi = {
	getAllConditions: () => api.get<IResponse<TCondition[]>>(`/conditions`),

	createCondition: (body: { status: string }) =>
		api.post<IResponse<TCondition>>(`/conditions`, body),

	updateCondition: ({ id, body }: { id: string; body: { status: string } }) =>
		api.patch<IResponse<TCondition>>(`/conditions/${id}`, body),

	deleteCondition: (id: string) =>
		api.delete<IResponse<void>>(`/conditions/${id}`),
};
