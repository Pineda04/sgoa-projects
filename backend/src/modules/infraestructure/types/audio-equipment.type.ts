export type TAudioEquipment = {
  id: string;
  description: string;
  // classrooms?: TClassroom[];
};

// Tipo para creación
export type TCreateAudioEquipment = Omit<TAudioEquipment, 'id' | 'classrooms'>;

// Tipo para la actualización
export type TUpdateAudioEquipment = Partial<TCreateAudioEquipment>;
