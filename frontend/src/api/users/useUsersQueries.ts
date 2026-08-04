import { useQuery } from '@tanstack/react-query';
import { usersApi } from './users.api';
import { usersKeys } from './users.keys';

export const useUsers = (enabled = true) =>
	useQuery({
		queryKey: usersKeys.lists(),
		queryFn: usersApi.getAll,
		select: response => response.data.data,
		enabled,
		retry: false,
	});

export const useMonitorBuildingAssignments = (userId: string) =>
	useQuery({
		queryKey: usersKeys.monitorBuildings(userId),
		queryFn: () => usersApi.getMonitorBuildings(userId),
		select: response => response.data.data,
		enabled: Boolean(userId),
		retry: false,
	});
