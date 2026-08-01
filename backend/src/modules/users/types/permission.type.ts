export type TPermission = {
  id: string;
  action: string;
  subject: string;
};

export type TPermissionsCatalog = {
  permissions: TPermission[];
  lookupDependencies: Record<string, readonly string[]>;
};
