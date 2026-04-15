// Main type
export type TConnectivity = {
  id: string;
  description: string;
  // classrooms?: TClassroom[];
};

// Tipo para creación
export type TCreateConnectivity = Omit<TConnectivity, 'id' | 'classrooms'>;

// Tipo para la actualización
export type TUpdateConnectivity = Partial<TCreateConnectivity>;
