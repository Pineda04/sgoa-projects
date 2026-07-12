export const pcEquipmentsKeys = {
	all: ['pc-equipments'] as const,
	lists: () => [...pcEquipmentsKeys.all, 'list'] as const,
	list: (page: number, size: number) =>
		[...pcEquipmentsKeys.lists(), { page, size }] as const,
	details: () => [...pcEquipmentsKeys.all, 'detail'] as const,
	detail: (id: string) => [...pcEquipmentsKeys.details(), id] as const,
};

export const pcTypesKeys = {
	all: ['pc-types'] as const,
};

export const monitorTypesKeys = {
	all: ['monitor-types'] as const,
};

export const monitorSizesKeys = {
	all: ['monitor-sizes'] as const,
};
