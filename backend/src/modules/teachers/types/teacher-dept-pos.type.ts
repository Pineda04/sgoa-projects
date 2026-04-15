import { TCustomOmit, TCustomPick } from 'src/common/types';
import {
  TCenter,
  TCenterDepartment,
  TDepartment,
  TDepartmentJoin,
} from 'src/modules/centers/types';
import { TPosition } from 'src/modules/teachers-config/types';
import { TTeacher } from 'src/modules/teachers/types';

export type TTeacherDeptPos = {
  id: string;
  teacherId?: string;
  centerDepartmentId?: string;
  positionId?: string;
  // createdAt: string;
  startDate: Date;
  endDate: Date | null;
  // department?: Omit<TDepartment, 'uvs' | 'centerId' | 'facultyId'>;
  centerDepartment?: TCenterDepartment & {
    department: TCustomPick<TDepartment, 'name'>;
    center: TCustomPick<TCenter, 'name'>;
  };
  teacher?: Pick<TTeacher, 'id'>;
};

// Tipo para la creación
export type TCreateTeacherDeptPos = Omit<
  TTeacherDeptPos,
  | 'startDate' // lo agrega la base de datos
  | 'endDate'
  | 'id'
>;

export type TTeacherInclude = TTeacherDeptPos & {
  centerDepartmentId: string;
  position: TPosition;
  // department: Pick<TDepartment, 'id' | 'name'>;
  centerDepartment: TCenterDepartment & {
    department: TCustomPick<TDepartment, 'name'>;
    center: TCustomPick<TCenter, 'name'>;
  };
  teacher: {
    id: string;
    user: {
      id: string;
      name: string;
      code: string;
    };
  };
};

export type TCoordination = {
  centerDepartmentId: string;
  department: TCustomPick<TDepartment, 'id' | 'name'>;
  center: TCenter;
  position: TPosition;
};
