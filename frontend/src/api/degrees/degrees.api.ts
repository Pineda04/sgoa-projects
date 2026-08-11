import { api } from '@config/lib';
import { IResponse } from '@shared';
import { TAcademicCommonProps } from '../periods/periods.types';
import {
	TCreateDegreeName,
	TPostgrad,
	TPostgradDegree,
	TUndergrad,
	TUndergradDegree,
	TUpdateDegreeName,
} from './degrees.types';

// Titulos (Abarca Pregrados y Posgrados)
export const degreesApi = {
	getAllUndergrads: () =>
		api.get<IResponse<TAcademicCommonProps[]>>(`/undergrads`),

	getAllPostgrads: () =>
		api.get<IResponse<TAcademicCommonProps[]>>(`/postgrads`),

	createUndergrad: (body: TCreateDegreeName) =>
		api.post<IResponse<TUndergradDegree>>(`/undergrads`, body),

	updateUndergrad: ({ id, body }: { id: string; body: TUpdateDegreeName }) =>
		api.patch<IResponse<TUndergradDegree>>(`/undergrads/${id}`, body),

	deleteUndergrad: (id: string) =>
		api.delete<IResponse<TUndergradDegree>>(`/undergrads/${id}`),

	createPostgrad: (body: TCreateDegreeName) =>
		api.post<IResponse<TPostgradDegree>>(`/postgrads`, body),

	updatePostgrad: ({ id, body }: { id: string; body: TUpdateDegreeName }) =>
		api.patch<IResponse<TPostgradDegree>>(`/postgrads/${id}`, body),

	deletePostgrad: (id: string) =>
		api.delete<IResponse<TPostgradDegree>>(`/postgrads/${id}`),

	addTeacherUndergrad: ({ body }: { body: TUndergrad }) =>
		api.post<IResponse<{ teacherId: string; undergradId: string }>>(
			`/teachers-undergrad`,
			body
		),

	deleteTeacherUndergrad: ({ body }: { body: TUndergrad }) =>
		api.delete<IResponse<boolean>>(
			`/teachers-undergrad/user/${body.userId}/undergrad/${body.undergradId}`
		),

	addTeacherPostgrad: ({ body }: { body: TPostgrad }) =>
		api.post<IResponse<{ teacherId: string; postgradId: string }>>(
			`/teachers-postgrad`,
			body
		),

	deleteTeacherPostgrad: ({ body }: { body: TPostgrad }) =>
		api.delete<IResponse<boolean>>(
			`/teachers-postgrad/user/${body.userId}/postgrad/${body.postgradId}`
		),
};
