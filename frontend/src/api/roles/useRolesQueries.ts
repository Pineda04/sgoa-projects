import { useQuery } from '@tanstack/react-query';
import { rolesKeys } from './roles.keys';
import { rolesApi } from './roles.api';
import { STALE_TIME } from '@config/lib';

export const useGetAllRoles = () =>
	useQuery({
		queryKey: rolesKeys.all,
		queryFn: rolesApi.getAll,
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.VERY_LONG,
		select: res => res.data.data,
	});

export const useGetRole = (id: string) =>
	useQuery({
		queryKey: rolesKeys.detail(id),
		queryFn: () => rolesApi.getOne(id),
		enabled: !!id,
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.VERY_LONG,
		select: res => res.data.data,
	});

export const useGetPermissionsCatalog = () =>
	useQuery({
		queryKey: rolesKeys.permissionsCatalog,
		queryFn: rolesApi.getPermissionsCatalog,
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.VERY_LONG,
		select: res => res.data.data,
	});
