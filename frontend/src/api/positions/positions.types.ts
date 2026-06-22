import { TCenter } from "../centers";
import { TDepartmentJoin } from "../departments";
import { TAcademicCommonProps } from "../periods/periods.types";

export type TPosition = {
	centerDepartmentId: string;
	department: TDepartmentJoin;
	center: TCenter;
	position: TAcademicCommonProps;
};
