export type TRoomType = {
  id: string;
  description: string;
  // classrooms?: TClassroom[];
};

// Tipo para creación
export type TCreateRoomType = Omit<TRoomType, 'id' | 'classrooms'>;

// Tipo para la actualización
export type TUpdateRoomType = Partial<TCreateRoomType>;
