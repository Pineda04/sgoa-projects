export interface ITokens {
	access_token: string;
	refresh_token: string; // Actualmente no viene
}

export interface IAuthLogin {
	email: string;
	password: string;
}
