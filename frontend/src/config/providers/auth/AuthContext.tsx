import { createContext, useContext } from 'react';
import { IContextProps } from '@shared';

export const AuthContext = createContext({} as IContextProps);

export const useAuth = () => {
	const context = useContext(AuthContext);

	if (!context) throw new Error('useAuth must be used within a AuthProvider');

	return context;
};
