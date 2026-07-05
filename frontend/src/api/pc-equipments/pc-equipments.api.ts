import { api } from '@config/lib';
import { IResponse } from '@shared/interfaces';
import {
	TCreatePcEquipment,
	TMonitorSize,
	TMonitorType,
	TPcEquipment,
	TPcType,
	TUpdatePcEquipment,
} from './pc-equipments.types';

export const pcEquipmentsApi = {
	getAllPcEquipments: (page: number, size: number) =>
		api.get<IResponse<TPcEquipment[]>>(
			`/pc-equipments?page=${page}&size=${size}`
		),

	getOnePcEquipment: (id: string) =>
		api.get<IResponse<TPcEquipment>>(`/pc-equipments/${id}`),

	createPcEquipment: (body: TCreatePcEquipment) =>
		api.post<IResponse<TPcEquipment>>(`/pc-equipments`, body),

	updatePcEquipment: ({ id, body }: { id: string; body: TUpdatePcEquipment }) =>
		api.patch<IResponse<TPcEquipment>>(`/pc-equipments/${id}`, body),

	deletePcEquipment: (id: string) =>
		api.delete<IResponse<TPcEquipment>>(`/pc-equipments/${id}`),
};

export const pcTypesApi = {
	getAllPcTypes: () => api.get<IResponse<TPcType[]>>(`/pc-types`),
};

export const monitorTypesApi = {
	getAllMonitorTypes: () =>
		api.get<IResponse<TMonitorType[]>>(`/monitor-types`),
};

export const monitorSizesApi = {
	getAllMonitorSizes: () =>
		api.get<IResponse<TMonitorSize[]>>(`/monitor-sizes`),
};
