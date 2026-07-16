export const airConditionersKeys = {
	all: ['air-conditioners'] as const,
	lists: () => [...airConditionersKeys.all, 'list'] as const,
	list: () => [...airConditionersKeys.lists()] as const,
	details: () => [...airConditionersKeys.all, 'detail'] as const,
	detail: (id: string) => [...airConditionersKeys.details(), id] as const,
};
