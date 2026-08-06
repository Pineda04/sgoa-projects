import { useQuery } from '@tanstack/react-query';
import { buildingsKeys } from './buildings.keys';
import { buildingsApi } from './buildings.api';
import { STALE_TIME } from '@config';

export const useGetAllBuildings = (config?: { enabled?: boolean }) =>
	useQuery({
		queryKey: buildingsKeys.all,
		queryFn: buildingsApi.getAllBuildings,
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.VERY_LONG,
		select: res => res.data.data,
		enabled: config?.enabled,
	});

export const useGetBuildingById = (
	buildingId: string,
	config?: { enabled?: boolean }
) =>
	useQuery({
		queryKey: buildingsKeys.detail(buildingId),
		queryFn: () => buildingsApi.getBuildingById(String(buildingId)),
		enabled: config?.enabled !== false && buildingId !== '',
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.VERY_LONG,
		select: res => res.data.data,
	});
