export const monitorKeys = {
	all: ['monitor'] as const,
	lists: () => [...monitorKeys.all, 'list'] as const,
	list: (page: number) => [...monitorKeys.lists(), { page }] as const,
	details: () => [...monitorKeys.all, 'detail'] as const,
	detail: (id: string) => ['monitor-detail', id] as const,
};
