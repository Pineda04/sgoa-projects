export const digitalBlackboardsKeys = {
	all: ['digital-blackboards'] as const,
	details: () => [...digitalBlackboardsKeys.all, 'detail'] as const,
	detail: (id: string) => [...digitalBlackboardsKeys.details(), id] as const,
};
