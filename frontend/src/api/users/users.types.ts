import { userCreateSchema, userUpdateSchema } from "@features/admin/users/schemas";
import z from "zod";

export type TCreateUser = z.infer<typeof userCreateSchema>;

export type TUpdateUser = z.infer<typeof userUpdateSchema>;

export interface TUserListItem {
	id: string;
	name: string;
	code: string;
	email: string | null;
	activeStatus: boolean;
	userRoles: { role: { id: string; name: string } }[];
}

export interface TMonitorBuildingAssignmentResult {
	userId: string;
	buildings: {
		id: string;
		name: string;
		centerId: string;
		centerName: string;
	}[];
}
