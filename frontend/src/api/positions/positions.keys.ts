export const positionsKeys = {
	all: ['positions'] as const,
	detail: (id: string) => [...positionsKeys.all, 'detail', id] as const,
	page: (page: number) => [...positionsKeys.all, 'page', page] as const,
};
