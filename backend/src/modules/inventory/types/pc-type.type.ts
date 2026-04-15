export type TPcType = {
  id: string;
  description: string;
  // pcEquipments?: TPCEquipment[];
  // airConditioners?: TAirConditioner[];
};

// Tipo para la creación
export type TCreatePcType = Omit<
  TPcType,
  'id' | 'pcEquipments' | 'airConditioners'
>;

// Tipo para la actualización
export type TUpdatePcType = Partial<TCreatePcType>;
