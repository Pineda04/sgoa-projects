export const usersKeys = {
	all: ['users'] as const,
	lists: () => [...usersKeys.all, 'list'] as const,
	list: (page: number, size: number, filters?: Record<string, string | undefined>) =>
		[...usersKeys.all, page, size, filters] as const,
	details: () => [...usersKeys.all, 'detail'] as const,
	detail: (id: string) => [...usersKeys.details(), id] as const,
	search: (searchTerm: string, page: number) =>
		[...usersKeys.all, 'search', searchTerm, page] as const,
	monitorBuildings: (userId: string) =>
		[...usersKeys.detail(userId), 'monitor-buildings'] as const,
};
