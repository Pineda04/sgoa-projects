import { courseClassroomSchema } from '@features/academic/reports/schemas';
import { TDepartment } from '..';
import { TCenter } from '../centers';
import { TAcademicCommonProps } from '../periods/periods.types';
import { courseCreateSchema, courseUpdateSchema } from '@features/academic';
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
	studentCount: number;
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
