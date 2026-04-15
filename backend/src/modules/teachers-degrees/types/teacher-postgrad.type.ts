import { TPostgraduateDegree } from './postgrad.type';

export type TTeacherPostgrad = TPostgraduateDegree & {
  // teacherId: string;
  // postgraduateId: string;
  // postgraduate?: TPostgraduateDegree;
  // teacher?: Omit<TTeacher, 'postgradId' | 'undergradId'>;
  // postgraduateDegrees: {
  //   teacher: Pick<TTeacher, 'id'> & {
  //     userId: string;
  //     user: Pick<TUser, 'name' | 'code'>;
  //   };
  // }[];
  count: number;
  teachers: {
    id: string;
    teacherId: string;
    name: string;
    code: string;
  }[];
};

// export type TTeacherUndergradWithInclude = TTeacherUndergrad & {
//   undergraduate: TUndergraduateDegree;
//   teacher: Omit<TTeacher, 'undergradId'>;
// };

export type TCreateTeacherPostgrad = {
  teacherId: string;
  postgraduateId: string;
};
