import { useQuery } from '@tanstack/react-query';
import {
	monitorSizesApi,
	monitorTypesApi,
	pcEquipmentsApi,
	pcTypesApi,
} from './pc-equipments.api';
import {
	monitorSizesKeys,
	monitorTypesKeys,
	pcEquipmentsKeys,
	pcTypesKeys,
} from './pc-equipments.keys';
import { usePaginationParams } from '@shared/hooks';
import { STALE_TIME } from '@config/lib';

export const useGetPcEquipments = () => {
	const { page, size } = usePaginationParams();
	return useQuery({
		queryKey: pcEquipmentsKeys.list(page, size),
		queryFn: () => pcEquipmentsApi.getAllPcEquipments(page, size),
		staleTime: STALE_TIME.MEDIUM,
		select: res => res.data,
	});
};

export const useGetPcEquipment = (id: string) =>
	useQuery({
		queryKey: pcEquipmentsKeys.detail(id),
		queryFn: () => pcEquipmentsApi.getOnePcEquipment(id),
		enabled: Boolean(id),
		staleTime: STALE_TIME.MEDIUM,
		select: res => res.data.data,
	});

export const useGetAllPcTypes = () =>
	useQuery({
		queryKey: pcTypesKeys.all,
		queryFn: pcTypesApi.getAllPcTypes,
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.VERY_LONG,
		select: res => res.data.data,
	});

export const useGetAllMonitorTypes = () =>
	useQuery({
		queryKey: monitorTypesKeys.all,
		queryFn: monitorTypesApi.getAllMonitorTypes,
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.VERY_LONG,
		select: res => res.data.data,
	});

export const useGetAllMonitorSizes = () =>
	useQuery({
		queryKey: monitorSizesKeys.all,
		queryFn: monitorSizesApi.getAllMonitorSizes,
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.VERY_LONG,
		select: res => res.data.data,
	});
