import { TCenter, TCourseClassroom, TCourseStadistic, TDepartment, TDepartmentJoin } from "..";
import { TPosition } from "../positions";

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
	roles?: string[];
	positions?: {
		centerDepartmentId: string;
		center: TCenter;
		department: TDepartmentJoin;
		position: TPosition;
	}[];
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
