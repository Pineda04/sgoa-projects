import { api } from '@config/lib';
import { IResponse } from '@shared/interfaces';
import {
	TCreatePcEquipment,
	TMonitorSize,
	TMonitorType,
	TPcEquipment,
	TPcEquipmentWithRelations,
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

	getPcEquipmentsByClassroom: (classroomId: string) =>
		api.get<IResponse<TPcEquipmentWithRelations[]>>(
			`/pc-equipments/by-classroom/${classroomId}`
		),

	createPcEquipment: (body: TCreatePcEquipment) =>
		api.post<IResponse<TPcEquipment>>(`/pc-equipments`, body),

	updatePcEquipment: ({ id, body }: { id: string; body: TUpdatePcEquipment }) =>
		api.patch<IResponse<TPcEquipment>>(`/pc-equipments/${id}`, body),

	deletePcEquipment: (id: string) =>
		api.delete<IResponse<TPcEquipment>>(`/pc-equipments/${id}`),
};

export const pcTypesApi = {
	getAllPcTypes: () => api.get<IResponse<TPcType[]>>(`/pc-types`),

	createPcType: (body: { description: string }) =>
		api.post<IResponse<TPcType>>(`/pc-types`, body),

	updatePcType: ({
		id,
		body,
	}: {
		id: string;
		body: { description: string };
	}) => api.patch<IResponse<TPcType>>(`/pc-types/${id}`, body),

	deletePcType: (id: string) =>
		api.delete<IResponse<void>>(`/pc-types/${id}`),
};

export const monitorTypesApi = {
	getAllMonitorTypes: () =>
		api.get<IResponse<TMonitorType[]>>(`/monitor-types`),

	createMonitorType: (body: { description: string }) =>
		api.post<IResponse<TMonitorType>>(`/monitor-types`, body),

	updateMonitorType: ({
		id,
		body,
	}: {
		id: string;
		body: { description: string };
	}) => api.patch<IResponse<TMonitorType>>(`/monitor-types/${id}`, body),

	deleteMonitorType: (id: string) =>
		api.delete<IResponse<void>>(`/monitor-types/${id}`),
};

export const monitorSizesApi = {
	getAllMonitorSizes: () =>
		api.get<IResponse<TMonitorSize[]>>(`/monitor-sizes`),

	createMonitorSize: (body: { description: string }) =>
		api.post<IResponse<TMonitorSize>>(`/monitor-sizes`, body),

	updateMonitorSize: ({
		id,
		body,
	}: {
		id: string;
		body: { description: string };
	}) => api.patch<IResponse<TMonitorSize>>(`/monitor-sizes/${id}`, body),

	deleteMonitorSize: (id: string) =>
		api.delete<IResponse<void>>(`/monitor-sizes/${id}`),
};
