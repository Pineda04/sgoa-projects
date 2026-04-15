export type TCourseStadistic = {
  id: string;
  APB: number;
  RPB: number;
  NSP: number;
  ABD: number;
  courseClassroomId: string;
  // courseClassroom?: TCourseClassroom;
};

// Tipo para la creación
export type TCreateCourseStadistic = Omit<
  TCourseStadistic,
  'id' | 'courseClassroom'
>;

// Tipo para la actualización
export type TUpdateCourseStadistic = Partial<TCreateCourseStadistic> & {
  id: string;
};
