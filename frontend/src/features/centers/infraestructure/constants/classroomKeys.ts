export const classroomKeys = {
	all: ['classrooms'] as const,
	lists: () => [...classroomKeys.all, 'list'] as const,
	list: (page: number) => [...classroomKeys.all, page] as const,
	details: () => [...classroomKeys.all, 'detail'] as const,
	detail: (id: string) => [...classroomKeys.details(), id] as const,
	search: (searchTerm: string, page: number) =>
		[...classroomKeys.all, 'search', searchTerm, page] as const,
};
