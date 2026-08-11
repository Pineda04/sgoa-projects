import { api } from '@config';
import { IResponse } from '@shared';
import {
	TAudioEquipment,
	TCreateAudioEquipment,
	TUpdateAudioEquipment,
} from './audio-equipments.types';

export const audioEquipmentsApi = {
	getAllAudioEquipments: () =>
		api.get<IResponse<TAudioEquipment[]>>('/audio-equipments'),

	getAudioEquipmentById: (id: string) =>
		api.get<IResponse<TAudioEquipment>>(`/audio-equipments/${id}`),

	createAudioEquipment: (body: TCreateAudioEquipment) =>
		api.post<IResponse<TAudioEquipment>>('/audio-equipments', body),

	updateAudioEquipment: (id: string, body: TUpdateAudioEquipment) =>
		api.patch<IResponse<TAudioEquipment>>(`/audio-equipments/${id}`, body),

	deleteAudioEquipment: (id: string) =>
		api.delete<IResponse<void>>(`/audio-equipments/${id}`),
};
