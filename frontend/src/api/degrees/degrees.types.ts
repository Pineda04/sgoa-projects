export type TUndergrad = {
	userId: string;
	undergradId: string;
};

export type TPostgrad = {
	userId: string;
	postgradId: string;
};

export type TUndergradDegree = {
	id: string;
	name: string;
};

export type TPostgradDegree = {
	id: string;
	name: string;
};

export type TCreateDegreeName = {
	name: string;
};

export type TUpdateDegreeName = Partial<TCreateDegreeName>;
