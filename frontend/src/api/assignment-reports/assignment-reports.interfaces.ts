import {
	TPlanification,
	TPlanificationWithErrors,
} from './assignment-reports.types';

export interface ICreateAcademicAssignmentParams {
	centerDepartmentId: string;
	formData: FormData;
}

export interface ICreateAcademicAssignmentArrayParams {
	centerDepartmentId: string;
	assignments: TPlanification[];
}

export interface ICreateAcademicAssignmentArrayResponse {
	assignments: TPlanification[];
	invalidElements: TPlanificationWithErrors[];
}

export interface IViewAcademicAssignmentParams {
	centerDepartmentId: string;
	formData: FormData;
}

export interface IPlanification {
	teacherCode: string;
	teacherName: string;
	courseCode: string;
	courseName: string;
	section: string;
	uv: number;
	days: string;
	studentCount: number | null;
	classroomName: string;
	departmentName: string;
	coordinator: string;
	center: string;
	nearGraduation: boolean;
	observation: string;
}

export const EMPTY_ROW: IPlanification = {
	teacherCode: '',
	teacherName: '',
	courseCode: '',
	courseName: '',
	section: '',
	uv: 0,
	days: '',
	studentCount: null,
	classroomName: '',
	departmentName: '',
	coordinator: '',
	center: '',
	nearGraduation: false,
	observation: '',
};
