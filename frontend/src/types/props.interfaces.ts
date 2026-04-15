import { IAuthLogin, ITokens } from '@features/auth';
import { IResponse } from './api.interface';
import { IUser } from './token-payload.interface';

export interface IAuthStateProps {
	isAuthenticated: boolean;
	user: IUser | null;
	isLoading: boolean;
	errors: null | string[] | string;
}

export interface IContextProps {
	// user: IUser | null;
	// isAuthenticated: boolean;
	// isLoading: boolean;
	authState: IAuthStateProps;
	login: (credentials: IAuthLogin) => Promise<IResponse<ITokens>>;
	logout: () => void;
	// accessToken: string | null;
	cleanErrors: (errors: null) => void;
	//hasRole: (role: string) => boolean;
}

export interface IChildrenProps {
	children?: React.ReactNode | React.ReactNode[];
}

export interface ICommonTables<T> {
	isLoading: boolean;
	isError: boolean;
	data: IResponse<T[]> | null;
	onNavigateToCreate?: () => void;
	currentPage: number;
	functionsPagination: {
		handleNextPage: () => void;
		handlePrevPage: () => void;
		handleSelectPage: (selectedPage: number) => void;
	};
}

export interface IOptions<T> {
	value: string;
	label: string;
	data: T;
}
