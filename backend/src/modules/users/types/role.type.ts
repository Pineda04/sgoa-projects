export type TRole = {
  id: string;
  name: string;
  description: string | null;
  isSuperAdmin: boolean;
};

export type TRoleWithPermissions = TRole & {
  permissions: { id: string; action: string; subject: string }[];
};
