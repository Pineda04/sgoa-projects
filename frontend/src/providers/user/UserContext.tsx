import { TOutputTeacherPosition, TPosition } from '@features/teachers';
import { createContext, useContext } from 'react';

export const UserContext = createContext(
	{} as {
		user: TOutputTeacherPosition | undefined;
		headPositions: TPosition[];
		isLoading: boolean;
		isError: boolean;
	}
);

export const useUser = () => {
	const context = useContext(UserContext);

	if (!context) throw new Error('useUser must be used within a UserProvider');

	return context;
};
