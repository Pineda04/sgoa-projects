import {
	TAcademicCommonProps,
	TPostgrad,
	TUndergrad,
} from '@features/teachers';
import { api } from '@lib/api/axios';
import { IResponse } from '@types';

export const degreesApi = {
	// Undergrads
	getAllUndergrads: () =>
		api.get<IResponse<TAcademicCommonProps[]>>(`/undergrads`),

	// Postgrads
	getAllPostgrads: () =>
		api.get<IResponse<TAcademicCommonProps[]>>(`/postgrads`),

	addTeacherUndergrad: ({ body }: { body: TUndergrad }) =>
		api.post<IResponse<{ teacherId: string; undergradId: string }>>(
			`teachers-undergrad`,
			body
		),

	deleteTeacherUndergrad: ({ body }: { body: TUndergrad }) =>
		api.delete<IResponse<boolean>>(
			`teachers-undergrad/user/${body.userId}/undergrad/${body.undergradId}`
		),

	addTeacherPostgrad: ({ body }: { body: TPostgrad }) =>
		api.post<IResponse<{ teacherId: string; postgradId: string }>>(
			`teachers-postgrad`,
			body
		),

	deleteTeacherPostgrad: ({ body }: { body: TPostgrad }) =>
		api.delete<IResponse<boolean>>(
			`teachers-postgrad/user/${body.userId}/postgrad/${body.postgradId}`
		),
};
