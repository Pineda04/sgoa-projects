export const monitorKeys = {
	all: ['monitor'] as const,
	currentAssignments: () => [...monitorKeys.all, 'current-assignments'] as const,
};
