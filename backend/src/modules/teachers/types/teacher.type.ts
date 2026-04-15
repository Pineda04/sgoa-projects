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
