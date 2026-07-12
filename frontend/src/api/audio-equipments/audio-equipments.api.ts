import { api } from '@config/lib';
import { IResponse } from '@shared/interfaces';
import { TAudioEquipment } from './audio-equipments.types';

export const audioEquipmentsApi = {
	getAllAudioEquipments: () =>
		api.get<IResponse<TAudioEquipment[]>>(`/audio-equipments`),
};
