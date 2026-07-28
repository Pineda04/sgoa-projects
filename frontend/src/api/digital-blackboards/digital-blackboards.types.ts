export type TDigitalBlackboard = {
	id: string;
	description: string | null;
	brandId: string;
	monitorTypeId: string;
	monitorSizeId: string;
	conditionId: string;
};

export type TCreateDigitalBlackboard = {
	description?: string | null;
	brandId: string;
	monitorTypeId: string;
	monitorSizeId: string;
	conditionId: string;
};

export type TUpdateDigitalBlackboard = Partial<TCreateDigitalBlackboard>;
