import { api } from '@lib/api/axios';
import { IResponse } from '@types';
import type { TCourseClassroom } from '../types';

export const coursesTeacherApi = {
	getCurrentUserCourses: () =>
		api.get<IResponse<TCourseClassroom[]>>(
			`/course-classrooms/my/current-period`
		),
};