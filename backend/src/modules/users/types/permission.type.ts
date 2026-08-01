export type TPermission = {
  id: string;
  action: string;
  subject: string;
};

export type TPermissionsCatalog = {
  permissions: TPermission[];
  impliedPermissions: Partial<Record<string, readonly string[]>>;
};
