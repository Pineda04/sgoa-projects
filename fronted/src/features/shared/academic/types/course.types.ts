import type { TCenter } from '@features/centers';
import type { TAcademicCommonProps } from './academic.types';

export type TCourse = {
	id: string;
	name: string;
	code: string;
	uvs: number;
	activeStatus: boolean;
	departmentId: string;
};

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