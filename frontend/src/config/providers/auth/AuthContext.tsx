import { IContextProps } from '@shared/interfaces';
import { createContext, useContext } from 'react';

export const AuthContext = createContext({} as IContextProps);

export const useAuth = () => {
	const context = useContext(AuthContext);

	if (!context) throw new Error('useAuth must be used within a AuthProvider');

	return context;
};
