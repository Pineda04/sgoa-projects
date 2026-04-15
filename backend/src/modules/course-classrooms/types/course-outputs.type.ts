import { TDepartment } from 'src/modules/centers/types';

export type TOutputCourseWithSelect = {
  id: string;
  code: string;
  name: string;
  uvs: number;
  departmentId: string;
  activeStatus: boolean;
  department: Omit<TDepartment, 'uvs' | 'centerId' | 'facultyId'>;
};
