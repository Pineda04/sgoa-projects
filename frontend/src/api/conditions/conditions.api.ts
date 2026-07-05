import { api } from '@config/lib';
import { IResponse } from '@shared/interfaces';
import { TCondition } from './conditions.types';

export const conditionsApi = {
	getAllConditions: () => api.get<IResponse<TCondition[]>>(`/conditions`),
};
