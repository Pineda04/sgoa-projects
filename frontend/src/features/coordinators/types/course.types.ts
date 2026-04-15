import { TCourse } from '@features/teachers';

export type TCourseBasicInfo = Omit<TCourse, 'departmentId' | 'facultyId'> & {
	department: { id: string; name: string };
};
