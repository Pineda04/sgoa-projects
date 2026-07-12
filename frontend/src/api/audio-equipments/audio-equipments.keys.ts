export const audioEquipmentsKeys = {
  all: ['audioEquipments'] as const,
  lists: () => [...audioEquipmentsKeys.all, 'list'] as const,
  list: (filters: string) => [...audioEquipmentsKeys.lists(), { filters }] as const,
  details: () => [...audioEquipmentsKeys.all, 'detail'] as const,
  detail: (id: string) => [...audioEquipmentsKeys.details(), id] as const,
};