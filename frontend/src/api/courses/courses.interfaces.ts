export interface ICreateCourse {
	name: string;
	code: string;
	uvs: number;
	activeStatus: boolean;
	departmentId: string;
}

export interface IUpdateCourse {
	name?: string;
	code?: string;
	uvs?: number;
	activeStatus?: boolean;
	departmentId?: string;
}

export interface ICoursesListProps {
	centerDepartmentId?: string;
	centerId?: string;
	showDepartmentFilter?: boolean;
	showDepartmentInTable?: boolean;
}
