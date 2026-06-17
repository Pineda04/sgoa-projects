export const departmentKeys = {
    all: ['departments'] as const,
    lists: () => [...departmentKeys.all, 'list'] as const,
    //list: (page: number, size: number) => [...departmentKeys.all, page, size] as const,
    details: () => [...departmentKeys.all, 'detail'] as const,
    detail: (id: string) => [...departmentKeys.details(), id] as const,
    //search: (searchTerm: string, page: number) =>
	//	[...departmentKeys.all, 'search', searchTerm, page] as const,
}