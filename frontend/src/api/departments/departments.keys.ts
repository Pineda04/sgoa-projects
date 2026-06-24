export const departmentsKeys = {
	all: ['departments'] as const,
	allForTable: ['departmentsForTable'] as const,
	detail: (id: string) => [...departmentsKeys.all, 'detail', id] as const,
	lists: () => [...departmentsKeys.all, 'list'] as const,
	//list: (page: number, size: number) => [...departmentKeys.all, page, size] as const,
	details: () => [...departmentsKeys.all, 'detail'] as const,
	//search: (searchTerm: string, page: number) =>
	//	[...departmentKeys.all, 'search', searchTerm, page] as const,
};
