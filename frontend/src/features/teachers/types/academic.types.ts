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
