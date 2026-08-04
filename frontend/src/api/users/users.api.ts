import {
	TCreateUser,
	TMonitorBuildingAssignmentResult,
	TUpdateUser,
	TUserListItem,
} from './users.types';
import { TOutputTeacherPosition } from '../teachers';
import { api } from '@config';
import { IResponse } from '@shared';

export const usersApi = {
	getAll: () => api.get<IResponse<TUserListItem[]>>('/users'),
	getMonitorBuildings: (userId: string) =>
		api.get<IResponse<TMonitorBuildingAssignmentResult>>(
			`/users/${userId}/monitor-buildings`
		),
	replaceMonitorBuildings: ({
		userId,
		buildingIds,
	}: {
		userId: string;
		buildingIds: string[];
	}) =>
		api.put<IResponse<TMonitorBuildingAssignmentResult>>(
			`/users/${userId}/monitor-buildings`,
			{ buildingIds }
		),
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
