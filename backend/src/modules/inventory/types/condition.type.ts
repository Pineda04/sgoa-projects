export type TCondition = {
  id: string;
  status: string;
  // pcEquipments?: TPCEquipment[];
  // airConditioners?: TAirConditioner[];
};

// Tipo para la creación
export type TCreateCondition = Omit<
  TCondition,
  'id' | 'pcEquipments' | 'airConditioners'
>;

// Tipo para la actualización
export type TUpdateCondition = Partial<TCreateCondition>;
