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

// mostrada en la tabla de departamentos de RRHH en la ruta: /rrhh/departamentos

export type TOutputDepartment = {
	id: string;
	name: string;
	uvs: number | null;
	facultyId: string;
	facultyName: string;		//descomentada linea del servicio
	coordinations: Coordination[];
}

export type Coordination = {
	centerDepartmentId: string;
	centerId: string;
	centerName: string;
	coordinator: Coordinator;
}

export type Coordinator = {
	teacherId: string;
	userId: string;
	name: string;
	code: string;
}
