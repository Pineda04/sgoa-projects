export const classroomsKeys = {
	all: ['classrooms'] as const,
	lists: () => [...classroomsKeys.all, 'list'] as const,
	list: (page: number) => [...classroomsKeys.all, page] as const,
	details: () => [...classroomsKeys.all, 'detail'] as const,
	detail: (id: string) => [...classroomsKeys.details(), id] as const,
	search: (searchTerm: string, page: number) =>
		[...classroomsKeys.all, 'search', searchTerm, page] as const,
};
