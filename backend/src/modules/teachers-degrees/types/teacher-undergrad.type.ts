export type TTeacherUndergrad = {
  // teacherId: string;
  // undergraduateId: string;
  // undergraduate?: TUndergraduateDegree;
  // teacher?: Omit<TTeacher, 'undergradId'>;
  // undergraduateDegrees: {
  // teachers: {
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

export type TCreateTeacherUndergrad = {
  teacherId: string;
  undergraduateId: string;
};
