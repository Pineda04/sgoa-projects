export type TMonitorSize = {
  id: string;
  description: string;
  // pcEquipments?: TPCEquipment[];
  // airConditioners?: TAirConditioner[];
};

// Tipo para la creación
export type TCreateMonitorSize = Omit<
  TMonitorSize,
  'id' | 'pcEquipments' | 'airConditioners'
>;

// Tipo para la actualización
export type TUpdateMonitorSize = Partial<TCreateMonitorSize>;
