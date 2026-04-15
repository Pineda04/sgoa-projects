// Para no crear uno por cada type, usar estos cuando sea necesario o omitir algo en especifico
export type TCustomOmit<T, K extends keyof T> = Omit<T, K>;

export type TCustomPartial<T> = Partial<T>;

export type TCustomPick<T, K extends keyof T> = Pick<T, K>;
