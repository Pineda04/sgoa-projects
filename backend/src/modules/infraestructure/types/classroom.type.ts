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
  digitalBlackboardId?: string | null;
  maxCapacity?: number | null;
  activeStatus?: boolean;
  // building?: TBuilding;
  // roomType?: TRoomType;
  // connectivity?: TConnectivity;
  // audioEquipment?: TAudioEquipment;
  // airConditioners?: TAirConditioner[];
  // courseClassrooms?: TCourseClassroom[];
};


export type TClassroomWithDepartments = TClassroom & {
  departments: TClassroomDepartmentInfo[];
};

export type TClassroomDepartmentInfo = {
  id: string;
  name: string;
  uvs: number | null;
  facultyId: string;
};

export type TDigitalBlackboardType = {
  id: string;
  description: string | null;
  brandId: string;
  monitorTypeId: string;
  monitorSizeId: string;
  conditionId: string;
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

type Occupied = {
  startTime: string;
  endTime: string;
  courseId: string;
  teacherId: string;
};

type Available = {
  startTime: string;
  endTime: string;
};

export type ClassroomScheduleDto = {
  classroomId: string;
  periodId: string;
  schedule: Partial<Record<DayOfWeek, DaySchedule>>;
};

type DaySchedule = {
  occupied: Occupied[];
  available: Available[];
};

type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';