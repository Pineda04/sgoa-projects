import { TCreateUser, TUpdateUser } from './users.types';
import { TOutputTeacherPosition } from '../teachers';
import { api } from '@config';
import { IResponse } from '@shared';

export const usersApi = {
	createUser: (body: TCreateUser) =>
		api.post<IResponse<TOutputTeacherPosition>>(`/users`, body),

	updateUser: ({ body }: { body: TUpdateUser }) =>
		api.patch(`/users/my`, body),

	updateUserOther: ({
		userId,
		body,
	}: {
		userId?: string;
		body: TUpdateUser;
	}) => api.patch(`/users/${userId}`, body),
};
