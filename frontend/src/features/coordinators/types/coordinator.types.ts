import { TDepartment, TCenter } from '@features/centers';
import { TPosition } from '@features/teachers';

export type TCoordinator = {
	id: string;
	teacherId: string;
	name: string;
	code: string;
};

export type TCoordination = {
	centerDepartmentId: string;
	department: Pick<TDepartment, 'id' | 'name'>;
	center: TCenter;
	position: TPosition;
};

export interface Planification {
	teacherCode: string;
	teacherName: string;
	courseCode: string;
	courseName: string;
	section: string;
	uv: number;
	days: string;
	studentCount: number;
	classroomName: string;
	departmentName: string;
	coordinator: string;
	center: string;
	nearGraduation: boolean;
	observation: string;
}

export const EMPTY_ROW: Planification = {
	teacherCode: '',
	teacherName: '',
	courseCode: '',
	courseName: '',
	section: '',
	uv: 0,
	days: '',
	studentCount: 0,
	classroomName: '',
	departmentName: '',
	coordinator: '',
	center: '',
	nearGraduation: false,
	observation: '',
};
