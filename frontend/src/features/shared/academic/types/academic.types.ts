export type TAcademicCommonProps = {
	id: string;
	name: string;
};

export type TPacModality = 'Trimestre' | 'Semestre';

export type TCurrentAcademicPeriod = {
	id: string;
	year: number;
	pac_modality: TPacModality;
	pac: number;
	title: string;
	startDate?: string;
	endDate?: string;
};

export type TPacData = {
	id: string;
	pac: number;
	pac_modality: TPacModality;
	year: number;
};

export type TUndergrad = {
	userId: string;
	undergradId: string;
};

export type TPostgrad = {
	userId: string;
	postgradId: string;
};

export type TCreateAcademicPeriodDto = {
	year: number;
	pac: number;
	pac_modality: TPacModality;
	startDate: string;
	endDate: string;
};

export type TUpdateAcademicPeriodDto = Partial<TCreateAcademicPeriodDto>;