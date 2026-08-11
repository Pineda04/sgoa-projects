import { TCenter } from '../centers';
import { TDepartmentJoin } from '../departments';
import { TAcademicCommonProps } from '../periods/periods.types';

export type TPosition = {
	centerDepartmentId: string;
	department: TDepartmentJoin;
	center: TCenter;
	position: TAcademicCommonProps;
};

// Agregar estos tipos:
export type TOutputPosition = TAcademicCommonProps;

export type TCreatePosition = {
	name: string;
};

export type TUpdatePosition = Partial<TCreatePosition>;
