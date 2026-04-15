export type TModality = {
  id: string;
  name: string;
  // courseClassrooms?: TCourseClassroom[];
};

// Tipo para la creación
export type TCreateModality = Omit<TModality, 'id' | 'courseClassrooms'>;

// Tipo para la actualización
export type TUpdateModality = Partial<TCreateModality> & {
  id: string;
};
