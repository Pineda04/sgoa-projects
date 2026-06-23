export interface IUser {
	email: string;
	roles: string[];
	sub: string;
}

export interface ITokenPayload extends IUser {
	exp: number;
	iat: number;
}
