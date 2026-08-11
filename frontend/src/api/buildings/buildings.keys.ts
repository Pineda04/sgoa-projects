export const buildingsKeys = {
	all: ['buildings'] as const,
	lists: () => [...buildingsKeys.all, 'list'] as const,
	details: () => [...buildingsKeys.all, 'detail'] as const,
	detail: (id: string) => [...buildingsKeys.details(), id] as const,
};
