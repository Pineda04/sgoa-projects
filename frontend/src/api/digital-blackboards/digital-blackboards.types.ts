export type TDigitalBlackboard = {
	id: string;
	description: string | null;
	brandId: string;
	monitorTypeId: string;
	monitorSizeId: string;
	conditionId: string;
	classroom: {
		id: string;
		name: string;
		build: {
			id: string;
			name: string;
			center: {
				id: string;
				name: string;
			} | null;
		} | null;
	} | null;
};

export type TCreateDigitalBlackboard = {
	description?: string | null;
	brandId: string;
	monitorTypeId: string;
	monitorSizeId: string;
	conditionId: string;
	classroomId?: string | null;
};

export type TUpdateDigitalBlackboard = Partial<TCreateDigitalBlackboard>;
