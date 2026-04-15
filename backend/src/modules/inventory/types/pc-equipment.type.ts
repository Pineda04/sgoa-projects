export type TPcEquipment = {
  id: string;
  inventoryNumber: string;
  processor: string;
  ram: string;
  disk: string;
  brandId: string;
  conditionId: string;
  monitorTypeId: string;
  monitorSizeId: string;
  pcTypeId: string;
  classroomId?: string | null;
  departmentId?: string | null;
  // brand?: TBrand;
  // condition?: TCondition;
  // monitorType?: TMonitorType;
  // monitorSize?: TMonitorSize;
  // pcType?: TPcType;
  // classroom?: TClassroom;
  // department?: TDepartment;
};

// Tipo para la creación
export type TCreatePcEquipment = Omit<
  TPcEquipment,
  | 'id'
  | 'brand'
  | 'condition'
  | 'monitorType'
  | 'monitorSize'
  | 'pcType'
  | 'classroom'
  | 'department'
>;

// Tipo para la actualización
export type TUpdatePcEquipment = Partial<TCreatePcEquipment>;
