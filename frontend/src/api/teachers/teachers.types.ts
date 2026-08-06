import { TCenter, TCourseClassroom, TCourseStadistic, TDepartment } from '..';
import { TPosition } from '../positions';

export type TTeacherBasicInfo = {
	name: string;
	email: string | null;
	code: string;
	id: string;
	userId: string;
};

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
	roles: {
		id: string;
		name: string;
		isSuperAdmin: boolean;
	}[];
	positions?: TPosition[];
	activeStatus: boolean;
};

export type TOutputTeacherPosition = TOutputTeacher & {
	positions: TPosition[];
};

export type TTeacherPosition = {
	teacherName: string;
	position: string;
	department: string;
	faculty: string;
	center: string;
};

export type TTeachingSession = {
	id: string;
	consultHour: string | null; // ISO Date
	tutoringHour: string | null; // ISO Date
	assignmentReportId: string;
	courseClassrooms: (TCourseClassroom & {
		courseStadistic: TCourseStadistic | null;
	})[];
};

export type TTeachingSessionOmit = Omit<
	TTeachingSession,
	'id' | 'assignmentReportId' | 'courseClassrooms'
>;

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
