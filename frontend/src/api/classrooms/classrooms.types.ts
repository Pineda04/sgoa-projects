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
	departments?: { id: string; name: string }[];
};

// Forma reducida que devuelve el endpoint de búsqueda (/classrooms/search)
export type TClassroomSearch = {
	id: string;
	name: string;
	building: {
		id: string;
		name: string;
	};
};

//Hize este cambio por diferencias entre los campos en BE de crear y TClassroom
export type TCreateClassroom = Omit<TClassroom, 'id' | 'departments'> & {
  departmentIds?: string[];
};

export type TUpdateClassroom = Partial<TCreateClassroom>;

export type TOccupiedSlot = {
	startTime: string;
	endTime: string;
	courseId: string;
	courseName: string;
	teacherId: string;
	teacherName: string;
};

export type TAvailableSlot = {
	startTime: string;
	endTime: string;
};

export type TDaySchedule = {
	occupied: TOccupiedSlot[];
	available: TAvailableSlot[];
};

export type TDayOfWeek =
	| 'MONDAY'
	| 'TUESDAY'
	| 'WEDNESDAY'
	| 'THURSDAY'
	| 'FRIDAY'
	| 'SATURDAY'
	| 'SUNDAY';

export type TClassroomSchedule = {
	classroomId: string;
	periodId: string;
	schedule: Partial<Record<TDayOfWeek, TDaySchedule>>;
};
