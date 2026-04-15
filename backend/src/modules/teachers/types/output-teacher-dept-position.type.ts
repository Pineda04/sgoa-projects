import { TCustomPick } from 'src/common/types';
import {
  TCenterDepartment,
  TDepartment,
  TCenter,
} from 'src/modules/centers/types';

export type TOutputTeacherDeptPos = {
  id: string;
  userId?: string;
  teacherId?: string;
  code: string;
  name?: string;
  // departmentId?: string;
  // departmentName?: string;
  centerDepartment?: TCenterDepartment & {
    department: TCustomPick<TDepartment, 'name'>;
    center: TCustomPick<TCenter, 'name'>;
  };
  positionId?: string;
  positionName?: string;
  // createdAt: string;
  startDate: Date | string;
  endDate: Date | string | null;
};
