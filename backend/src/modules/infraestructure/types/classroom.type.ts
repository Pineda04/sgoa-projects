// Tipo principal
export type TClassroom = {
  id: string;
  name: string;
  desks: number;
  tables: number;
  projectors: number;
  powerOutlets: number;
  lights: number;
  blackboards: number;
  lecterns: number;
  windows: number;
  buildingId: string;
  roomTypeId: string;
  connectivityId?: string | null;
  audioEquipmentId?: string | null;
  conditionId?: string | null;
  // building?: TBuilding;
  // roomType?: TRoomType;
  // connectivity?: TConnectivity;
  // audioEquipment?: TAudioEquipment;
  // airConditioners?: TAirConditioner[];
  // courseClassrooms?: TCourseClassroom[];
};

// Tipo para creación
export type TCreateClassroom = Omit<
  TClassroom,
  | 'id'
  | 'building'
  | 'roomType'
  | 'connectivity'
  | 'audioEquipment'
  | 'airConditioners'
  | 'courseClassrooms'
>;

// Tipo para actualización
export type TUpdateClassroom = Partial<TCreateClassroom>;
