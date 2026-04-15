import { TCenter, TDepartmentJoin } from '@features/centers';
import { TAcademicCommonProps } from './academic.types';

export type TTeacher = {
	id: string;
	undergradId: string;
	postgradId?: string;
	categoryId: string;
	contractTypeId: string;
	shiftId: string;
};

export type TOutputTeacher = {
	id: string;
	name: string;
	code: string;
	email?: string;
	shiftStart?: string;
	shiftEnd?: string;
	categoryId: string;
	contractTypeId: string;
	shiftId: string;
	userId: string;
	categoryName: string;
	contractTypeName: string;
	shiftName: string;
	undergrads: {
		id: string;
		name: string;
	}[];
	postgrads: {
		id: string;
		name: string;
	}[];
	activeStatus: boolean;
};

export type TOutputTeacherPosition = TOutputTeacher & {
	positions: TPosition[];
};

export type TPosition = {
	centerDepartmentId: string;
	department: TDepartmentJoin;
	center: TCenter;
	position: TAcademicCommonProps;
};

// export type TCreateUser = Omit<TTeacher, "id"> & {
//   name: string;
//   code: string;
//   email: string;
//   password: string;
//   passwordConfirm: string;
// };

// Posición  o cargo segun el departamento
export type TTeacherPosition = {
	teacherName: string;
	position: string;
	department: string;
	faculty: string;
	center: string;
};
