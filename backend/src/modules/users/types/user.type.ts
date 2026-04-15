import { TRole } from './role.type';

export type TUser = {
  id: string;
  name: string;
  code: string;
  email: string | null;
  // roleId: string;
  // userRoles: {
  //   role: TRole;
  // }[];
  userRoles: {
    role: TRole;
  }[];
  // role: TRole;
  activeStatus: boolean;
};
