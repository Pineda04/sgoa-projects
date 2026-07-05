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
};

export type TCreatePcEquipment = Omit<TPcEquipment, 'id'>;

export type TUpdatePcEquipment = Partial<TCreatePcEquipment>;

export type TPcType = {
	id: string;
	description: string;
};

export type TMonitorType = {
	id: string;
	description: string;
};

export type TMonitorSize = {
	id: string;
	description: string;
};
