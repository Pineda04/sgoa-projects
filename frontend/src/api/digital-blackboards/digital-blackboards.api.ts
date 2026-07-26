import { api } from '@config/lib';
import { IResponse } from '@shared/interfaces';
import {
	TCreateDigitalBlackboard,
	TDigitalBlackboard,
	TUpdateDigitalBlackboard,
} from './digital-blackboards.types';

export const digitalBlackboardsApi = {
	getAllDigitalBlackboards: () =>
		api.get<IResponse<TDigitalBlackboard[]>>(`/digital-blackboards`),

	getOneDigitalBlackboard: (id: string) =>
		api.get<IResponse<TDigitalBlackboard>>(`/digital-blackboards/${id}`),

	createDigitalBlackboard: (body: TCreateDigitalBlackboard) =>
		api.post<IResponse<TDigitalBlackboard>>(`/digital-blackboards`, body),

	updateDigitalBlackboard: ({
		id,
		body,
	}: {
		id: string;
		body: TUpdateDigitalBlackboard;
	}) =>
		api.patch<IResponse<TDigitalBlackboard>>(
			`/digital-blackboards/${id}`,
			body
		),

	deleteDigitalBlackboard: (id: string) =>
		api.delete<IResponse<TDigitalBlackboard>>(`/digital-blackboards/${id}`),
};
