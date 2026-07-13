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

export type TCreateClassroom = Omit<TClassroom, 'id'>;

export type TUpdateClassroom = Partial<TCreateClassroom>;
