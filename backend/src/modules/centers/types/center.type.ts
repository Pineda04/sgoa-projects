import { TDepartment } from './department.type';

export type TCenter = {
  id: string;
  name: string;
};

export type TCenterJoin = TCenter & {
  departments: (TDepartment & {
    centerDepartmentId: string;
  })[];
};
