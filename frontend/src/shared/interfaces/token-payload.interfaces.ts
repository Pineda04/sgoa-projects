export interface IUser {
	email: string;
	roles: string[];
	permissions: string[];
	isSuperAdmin: boolean;
	sub: string;
}

export interface ITokenPayload extends IUser {
	exp: number;
	iat: number;
}
