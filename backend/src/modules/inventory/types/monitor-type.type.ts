export type TMonitorType = {
  id: string;
  description: string;
  // pcEquipments?: TPCEquipment[];
  // airConditioners?: TAirConditioner[];
};

// Tipo para la creación
export type TCreateMonitorType = Omit<
  TMonitorType,
  'id' | 'pcEquipments' | 'airConditioners'
>;

// Tipo para la actualización
export type TUpdateMonitorType = Partial<TCreateMonitorType>;
