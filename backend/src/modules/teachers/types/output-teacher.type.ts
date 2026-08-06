import { TCustomOmit } from 'src/common/types';
import { TCenter, TDepartmentJoin } from 'src/modules/centers/types';
import { TPosition } from 'src/modules/teachers-config/types';

export type TOutputTeacher = {
  id: string;
  name: string;
  code: string;
  email?: string;
  shiftStart?: string;
  shiftEnd?: string;
  categoryId: string;
  contractTypeId: string;
  shiftId: string;
  userId: string;
  categoryName: string;
  contractTypeName: string;
  shiftName: string;
  undergrads: {
    id: string;
    name: string;
  }[];
  postgrads: {
    id: string;
    name: string;
  }[];
  roles: {
    id: string;
    name: string;
    isSuperAdmin: boolean;
  }[];
  positions: {
    centerDepartmentId: string;
    center: TCenter;
    department: TDepartmentJoin;
    position: TPosition;
  }[];
  activeStatus: boolean;
};

export type TOutputTeacherCustom = TCustomOmit<
  TOutputTeacher,
  | 'categoryName'
  | 'contractTypeName'
  | 'shiftName'
  | 'postgrads'
  | 'undergrads'
  | 'roles'
  | 'positions'
>;
