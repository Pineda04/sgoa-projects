// Pregrados
export const undergradKeys = {
	all: ['undergrads'] as const,
	detail: (id: string) => [...undergradKeys.all, 'detail', id] as const,
	page: (page: number) => [...undergradKeys.all, 'page', page] as const,
};

// Posgrados
export const postgradKeys = {
	all: ['postgrads'] as const,
	detail: (id: string) => [...postgradKeys.all, 'detail', id] as const,
	page: (page: number) => [...postgradKeys.all, 'page', page] as const,
};
