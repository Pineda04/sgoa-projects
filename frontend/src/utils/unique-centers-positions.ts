import { TPosition } from '@features/teachers';

export const getUniqueCenters = (positions: TPosition[]) => {
	if (!positions) return [];

	const map = new Map();

	for (const pos of positions) {
		if (!map.has(pos.center.id)) {
			map.set(pos.center.id, pos.center);
		}
	}

	return Array.from(map.values());
};
