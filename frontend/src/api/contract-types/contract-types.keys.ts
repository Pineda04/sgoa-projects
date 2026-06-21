export const contractTypesKeys = {
	all: ['contract-types'] as const,
	detail: (id: string) => [...contractTypesKeys.all, 'detail', id] as const,
	page: (page: number) => [...contractTypesKeys.all, 'page', page] as const,
};
