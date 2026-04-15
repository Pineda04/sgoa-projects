import { TFaculty } from '@features/centers/types';
import { TCoordinator } from '@features/coordinators';

export type TDepartment = {
	id: string;
	name: string;
	uvs: number | null;
	facultyId: string;
};

export type TDepartmentJoin = TDepartment & {
	faculty: TFaculty;
};

export type TDepartmentCoordination = {
	centerDepartmentId: string;
	centerId: string;
	centerName: string;
	coordinator: TCoordinator;
};

export type TDepartmentWithCoordinations = TDepartment & {
	coordinations: TDepartmentCoordination[];
};
