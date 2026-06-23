export const usersKeys = {
	all: ['users'] as const,
	lists: () => [...usersKeys.all, 'list'] as const,
	list: (page: number, size: number) => [...usersKeys.all, page, size] as const,
	details: () => [...usersKeys.all, 'detail'] as const,
	detail: (id: string) => [...usersKeys.details(), id] as const,
	search: (searchTerm: string, page: number) =>
		[...usersKeys.all, 'search', searchTerm, page] as const,
};
