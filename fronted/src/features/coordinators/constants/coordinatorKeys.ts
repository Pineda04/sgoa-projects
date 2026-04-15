export const coordinatorKeys = {
	all: ['coordinators'] as const,
	lists: () => [...coordinatorKeys.all, 'list'] as const,
	list: (page: number) => [...coordinatorKeys.all, { page }] as const,
	my: ['coordinations'] as const,
};
