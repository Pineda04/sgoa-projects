import { api } from '@config/lib';
import { IResponse } from '@shared/interfaces';
import { TDigitalBlackboard } from './digital-blackboards.types';

export const digitalBlackboardsApi = {
	getAllDigitalBlackboards: () =>
		api.get<IResponse<TDigitalBlackboard[]>>(`/digital-blackboards`),
};
