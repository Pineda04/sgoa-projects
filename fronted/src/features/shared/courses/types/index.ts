import type { TCourse, TCourseClassroom } from '@features/teachers';

export type { TCourse, TCourseClassroom };

export interface ICoursesListProps {
	centerDepartmentId?: string;
	centerId?: string;
	showDepartmentFilter?: boolean;
	showDepartmentInTable?: boolean;
}
