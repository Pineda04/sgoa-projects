// Los 'teachers' terminan siendo usuarios, por lo que es mejor segmentarlos acá
export const userKeys = {
	all: ['users'] as const,
	lists: () => [...userKeys.all, 'list'] as const,
	list: (page: number, size: number) => [...userKeys.all, page, size] as const,
	details: () => [...userKeys.all, 'detail'] as const,
	detail: (id: string) => [...userKeys.details(), id] as const,
	search: (searchTerm: string, page: number) =>
		[...userKeys.all, 'search', searchTerm, page] as const,
};
