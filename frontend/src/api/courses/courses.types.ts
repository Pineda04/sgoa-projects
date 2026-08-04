import { TDepartment } from '..';
import { TCenter } from '../centers';
import { TAcademicCommonProps } from '../periods/periods.types';
import {
	courseClassroomSchema,
	courseCreateSchema,
	courseUpdateSchema,
	editCourseClassroomSchema,
} from '@features/academic';
import z from 'zod';

export type TCourse = {
	id: string;
	name: string;
	code: string;
	uvs: number;
	activeStatus: boolean;
	departmentId: string;
};

export type TCreateCourse = z.infer<typeof courseCreateSchema>;

export type TUpdateCourse = z.infer<typeof courseUpdateSchema>;

export type TCourseClassroom = {
	id: string;
	courseId: string;
	classroomId: string;
	teachingSessionId: string;
	section: string;
	days: string;
	studentCount: number | null;
	modalityId: string;
	nearGraduation: boolean;
	groupCode: string;
	observation?: string | null;
	course: Pick<TCourse, 'code' | 'uvs' | 'name'> & {
		department: {
			name: string;
			center: TAcademicCommonProps;
		};
	};
	classroom: Pick<TAcademicCommonProps, 'name'> & {
		center: TCenter;
	};
	coordinator: {
		name: string;
	};
};

export type TUpdateCourseClassroom = z.infer<typeof courseClassroomSchema>;

export type TCourseClassroomDetail = Pick<
	TCourseClassroom,
	| 'id'
	| 'courseId'
	| 'classroomId'
	| 'teachingSessionId'
	| 'section'
	| 'days'
	| 'studentCount'
	| 'modalityId'
	| 'nearGraduation'
	| 'groupCode'
	| 'observation'
> & {
	course: TCourse;
	classroom: {
		name: string;
		building: {
			name: string;
			centerId: string;
		};
	};
	teachingSession: {
		assignmentReport: {
			periodId: string;
			centerDepartmentId: string;
			teacher: {
				user: {
					name: string;
					code: string;
				};
			};
		};
	};
};

export type TEditCourseClassroom = z.infer<typeof editCourseClassroomSchema>;

export type TCourseStadistic = {
	id: string;
	APB: number;
	RPB: number;
	NSP: number;
	ABD: number;
	courseClassroomId: string;
};

export type TCourseStadisticOmit = Omit<
	TCourseStadistic,
	'id' | 'courseClassroomId'
>;

export type TCourseBasicInfo = Omit<TCourse, 'departmentId' | 'facultyId'> & {
	department: { id: string; name: string };
};

export type TCourseWithDepartment = TCourse & {
	department: Pick<TDepartment, 'id' | 'name'>;
};

export type TOutputConsolidated = {
	courseCode: string;
	courseName: string;
	section: string;
	initial: number | null;
	final: number;
	APB: number;
	RPB: number;
	NSP: number;
	ABD: number;
	teacherCode: string;
	teacherName: string;
	department: string;
	modality: string;
	indexAPB: number | null;
	indexRPB: number | null;
	indexNSP: number | null;
	indexABD: number | null;
	finalSummatoryInconsistency: 'Error' | 'Correcto';
	initialSummatoryInconsistency: 'Correcto' | 'Incorrecto';
	terminalEfficiency: number | null;
	pac: number;
	year: number;
};
