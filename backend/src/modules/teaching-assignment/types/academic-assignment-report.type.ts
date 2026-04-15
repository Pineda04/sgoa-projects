import { TTeacher } from 'src/modules/teachers/types';
import { TAcademicPeriod } from './academid-period.type';
import { TTeachingSession } from './teaching-session.type';
import { TUser } from 'src/modules/users/types';
import {
  TCenter,
  TCenterDepartment,
  TDepartment,
} from 'src/modules/centers/types';
import { TCustomOmit, TCustomPick } from 'src/common/types';
import { AcademicAssignmentDto } from '../dto';

export type TAcademicAssignmentReport = {
  id: string;
  teacherId?: string;
  centerDepartmentId?: string;
  periodId: string;
  centerDepartment?: TCenterDepartment & {
    department: TCustomPick<TDepartment, 'name'>;
    center: TCustomPick<TCenter, 'name'>;
  };
  teacher?: Pick<TTeacher, 'id'> & {
    user: Pick<TUser, 'id' | 'name' | 'code'>;
  };
  period?: TAcademicPeriod;
  // complementaryActivities?: TComplementaryActivity[];
  teachingSession?: TTeachingSession | null;
};

// Tipo para la creación
export type TCreateAcademicAssignmentReport = TCustomOmit<
  TAcademicAssignmentReport,
  // 'id' |
  'centerDepartment' | 'teacher' | 'period'
  // | 'teachingSessions'
>;

// Tipo para la actualización
export type TUpdateAcademicAssignmentReport =
  Partial<TCreateAcademicAssignmentReport>;

export type TAcademicAssignmentReportFileView = TCustomOmit<
  AcademicAssignmentDto,
  'id'
> & {
  userId: string;
  teacherId: string;
  centerDepartmentId: string;
};
