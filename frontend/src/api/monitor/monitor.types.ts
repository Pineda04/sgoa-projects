export type TMonitor = {
	id: string;
	name: string;
	code: string;
	email?: string;
	userId: string;
};

export type TScheduleCheck = {
	id: string;
	classroomId: string;
	compliance: boolean;
	checkedAt: string;
	monitorId: string;
};
