import { TCustomOmit, TCustomPick } from 'src/common/types';
import { TCenter, TDepartmentJoin } from 'src/modules/centers/types';
import {
  TContractType,
  TPosition,
  TShift,
  TTeacherCategory,
} from 'src/modules/teachers-config/types';
import {
  TPostgraduateDegree,
  TUndergraduateDegree,
} from 'src/modules/teachers-degrees/types';
import { TUser } from 'src/modules/users/types';

export type TTeacher = {
  id: string;
  undergradId: string;
  postgradId?: string;
  categoryId: string;
  contractTypeId: string;
  shiftId: string;
  shiftStart?: Date | null;
  shiftEnd?: Date | null;
};

export type TOutputTeacher = {
  id: string;
  name: string;
  email?: string;
  code: string;
  shiftStart?: string;
  shiftEnd?: string;
  shiftId: string;
  categoryId: string;
  contractTypeId: string;
  userId: string;
  categoryName: string;
  contractTypeName: string;
  shiftName: string;
  undergrads: { id: string; name: string }[];
  postgrads: { id: string; name: string }[];
  roles?: string[];
  activeStatus: boolean;
};

export type TOutputTeacherCustom = {
  id: string;
  name: string;
  code: string;
  categoryId: string;
  contractTypeId: string;
  shiftId: string;
  userId: string;
  activeStatus: boolean;
};
export type TTeacherJoin = TCustomOmit<
  TTeacher,
  'undergradId' | 'postgradId'
> & {
  category: TTeacherCategory;
  shift: TShift;
  contractType: TContractType;
  user: TCustomPick<TUser, 'id' | 'code' | 'name' | 'activeStatus'> & {
    email?: string;
  };
  undergradDegrees: {
    teacherId: string;
    undergraduateId: string;
    undergraduate: TPostgraduateDegree;
  }[];
  postgraduateDegrees: {
    teacherId: string;
    postgraduateId: string;
    postgraduate: TUndergraduateDegree;
  }[];
  positionHeld: {
    position: TPosition;
    centerDepartment: {
      id: string;
      department: TDepartmentJoin;
      center: TCenter;
    };
  }[];


};
