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

export type TOutputDepartment = TDepartment & {
	facultyName: string;	//descomentada linea del servicio
	coordinations: TDepartmentCoordination[];
	// Ojo: en la propiedad TCoordinator de coordinator.types.ts la prop userId no viene en la respuesta, viene como id
	// no se utiliza, pero por si llega a utilizar se deja el comentario
}