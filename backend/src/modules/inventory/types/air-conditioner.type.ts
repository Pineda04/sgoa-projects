export type TAirConditioner = {
  id: string;
  description?: string | null;
  brandId: string;
  conditionId: string;
  classroomId?: string | null;
  // brand?: TBrand;
  // condition?: TCondition;
  // classroom?: TClassroom;
};

// Tipo para creación
export type TCreateAirConditioner = Omit<
  TAirConditioner,
  'id' | 'brand' | 'condition' | 'classroom'
>;

// Tipo para la actualización
export type TUpdateAirConditioner = Partial<TCreateAirConditioner>;
