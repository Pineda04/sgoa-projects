import { Actions, Subjects } from '@config/lib/casl/ability';

export type TRole = {
	id: string;
	name: string;
	description: string | null;
	isSuperAdmin: boolean;
};

export type TPermission = {
	id: string;
	action: Actions;
	subject: Subjects;
};

export type TRoleWithPermissions = TRole & {
	permissions: TPermission[];
};

export type TCreateRole = {
	name: string;
	description?: string | null;
};

export type TUpdateRole = Partial<TCreateRole>;

export type TUpdateRolePermissions = {
	permissionIds: string[];
};
