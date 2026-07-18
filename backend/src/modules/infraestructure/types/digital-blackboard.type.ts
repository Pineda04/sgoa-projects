

// Tipo principal
export type TDigitalBlackboard = {
  id: string;
  description: string | null;
  brandId: string;
  monitorTypeId: string;
  monitorSizeId: string;
  conditionId: string;
};

// Tipo para creación
export type TCreateDigitalBlackboard = Omit <
  TDigitalBlackboard,
  | 'id' 
>;

// Tipo para actualización
export type TUpdateDigitalBlackboard = Partial<TCreateDigitalBlackboard>;