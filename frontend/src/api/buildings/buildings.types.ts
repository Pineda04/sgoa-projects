import { TCenter } from '../centers/centers.types';

export type TBuilding = {
	id: string;
	name: string;
	color: string | null;
	floors: string | null;
	centerId: string;
	center?: TCenter;
};

export type TCreateBuilding = Omit<TBuilding, 'id' | 'center' | 'classrooms'>;
export type TUpdateBuilding = Partial<TCreateBuilding>;
