import { TCenterDepartment } from '@features/centers';
import { TAcademicCommonProps, TCurrentAcademicPeriod } from './academic.types';
import { TComplementaryActivity } from './activity.types';
import { TCourseClassroom, TCourseStadistic } from './course.types';

export type TAssignmentReport = {
	id: string;
	periodId: string;
	period: TCurrentAcademicPeriod;
	teacher: {
		id: string;
		user: {
			id: string;
			name: string;
			code: string;
		};
	};
	centerDepartment: TCenterDepartment & {
		center: TAcademicCommonProps;
		department: TAcademicCommonProps;
	};
	teachingSession: TTeachingSession;
	complementaryActivities: TComplementaryActivity[];
};

export type TTeachingSession = {
	id: string;
	consultHour: string; // ISO Date
	tutoringHour: string; // ISO Date
	assignmentReportId: string;
	courseClassrooms: (TCourseClassroom & {
		courseStadistic: TCourseStadistic;
	})[];
};

export type TTeachingSessionOmit = Omit<
	TTeachingSession,
	'id' | 'assignmentReportId' | 'courseClassrooms'
>;
