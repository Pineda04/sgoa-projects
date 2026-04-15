export type TBuilding = {
  id: string;
  name: string;
  color?: string | null;
  floors?: string | null;
  centerId: string;
  // center?: TCenter;
  // classrooms?: TClassroom[];
};

// Tipo para creación
export type TCreateBuilding = Omit<TBuilding, 'id' | 'center' | 'classrooms'>;

// Tipo para actualización
export type TUpdateBuilding = Partial<TCreateBuilding>;
