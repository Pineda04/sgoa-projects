import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserContext } from './UserContext';
import { IChildrenProps } from '@shared/interfaces';
import { Loading } from '@shared/components';
import { getHeadPositions } from '@shared/utils';
import { teachersApi, teachersKeys } from '@api/teachers';
import { useAuth } from '@config/providers';

// NOTE: Puede ser utilizado para otras cosas, edicion...
export const UserProvider = ({ children }: IChildrenProps) => {
	const {
		authState: { isAuthenticated, isLoading: isAuthLoading },
	} = useAuth();

	const { data, isLoading, isError } = useQuery({
		queryKey: teachersKeys.detail('current'),
		queryFn: teachersApi.getCurrentTeacher,
		enabled: isAuthenticated,
		select: res => res.data.data,
	});

	const headPositions = useMemo(() => {
		return getHeadPositions(data?.positions);
	}, [data?.positions]);

	if (isAuthLoading) return <Loading />;

	return (
		<UserContext.Provider
			value={{ user: data, headPositions, isLoading, isError }}
		>
			{children}
		</UserContext.Provider>
	);
};
