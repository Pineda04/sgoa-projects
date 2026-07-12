import { useQuery } from '@tanstack/react-query';
import { audioEquipmentsApi } from './audio-equipments.api';
import { audioEquipmentsKeys } from './audio-equipments.keys';
import { STALE_TIME } from '@config/lib';

export const useGetAllAudioEquipments = () =>
	useQuery({
		queryKey: audioEquipmentsKeys.all,
		queryFn: audioEquipmentsApi.getAllAudioEquipments,
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.VERY_LONG,
		select: res => res.data.data,
	});
