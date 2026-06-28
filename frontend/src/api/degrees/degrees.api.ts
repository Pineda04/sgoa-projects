import { api } from '@config/lib';
import { IResponse } from '@shared';
import { TAcademicCommonProps } from "../periods/periods.types";
import { TPostgrad, TUndergrad } from "./degrees.types";

// Titulos (Abarca Pregrados y Posgrados)
export const degreesApi = {
	getAllUndergrads: () =>
		api.get<IResponse<TAcademicCommonProps[]>>(`/undergrads`),

	getAllPostgrads: () =>
		api.get<IResponse<TAcademicCommonProps[]>>(`/postgrads`),

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
