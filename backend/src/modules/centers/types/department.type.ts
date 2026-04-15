import { TCenter } from 'src/modules/centers/types';
import { TFaculty } from './faculty.type';

export type TDepartment = {
  id: string;
  name: string;
  uvs: number | null;
  facultyId: string;
};

export type TDepartmentJoin = TDepartment & {
  // center: TCenter;
  faculty: TFaculty;
};

export type TCenterDepartment = {
  id: string;
  departmentId: string;
  centerId: string;
};

export type TCenterDepartmentJoin = TCenterDepartment & {
  center: TCenter;
  department: TDepartment;
};
