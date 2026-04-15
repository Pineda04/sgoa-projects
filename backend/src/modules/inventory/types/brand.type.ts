export type TBrand = {
  id: string;
  name: string;
  // pcEquipments?: TPCEquipment[];
  // airConditioners?: TAirConditioner[];
};

// Tipo para creación
export type TCreateBrand = Omit<
  TBrand,
  'id' | 'pcEquipments' | 'airConditioners'
>;

// Tipo para la actualización
export type TUpdateBrand = Partial<TCreateBrand>;
