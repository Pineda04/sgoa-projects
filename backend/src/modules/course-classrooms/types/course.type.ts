export type TCourse = {
  id: string;
  name: string;
  code: string;
  uvs: number;
  activeStatus: boolean;
  departmentId: string;
  // department?: TDepartment;
  // courseClassrooms?: TCourseClassroom[];
};

// Tipo para la creación
export type TCreateCourse = Omit<
  TCourse,
  'id' | 'department' | 'courseClassrooms'
>;

// Tipo para la actualización
export type TUpdateCourse = Partial<TCreateCourse> & {
  id: string;
};
