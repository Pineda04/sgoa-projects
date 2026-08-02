export type TAirConditioner = {
	id: string;
	description: string | null;
	brand: {
		id: string;
		name: string;
	} | null;
	condition: {
		id: string;
		status: string;
	} | null;
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

export type TCreateAirConditioner = {
	description?: string | null;
	brandId: string;
	conditionId: string;
	classroomId?: string | null;
};

export type TUpdateAirConditioner = Partial<TCreateAirConditioner>;
