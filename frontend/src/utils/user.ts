import { EPosition } from '@constants';
import { TPosition } from '@features/teachers';

export const getHeadPositions = (positions?: TPosition[]) =>
	positions?.filter(p => p.position?.name === EPosition.DEPARTMENT_HEAD) ??
	[];
