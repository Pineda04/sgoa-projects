import { TPosition } from '@api';
import { EPosition } from '../constants';

export const getHeadPositions = (positions?: TPosition[]) =>
	positions?.filter(p => p.position?.name === EPosition.DEPARTMENT_HEAD) ??
	[];
