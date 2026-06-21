import { IChildrenProps } from '@shared/interfaces';
import { UserContext } from './UserContext';
import { useMemo } from 'react';
import { useGetCurrentTeacher } from '@api/teachers';
import { getHeadPositions } from '@shared/utils';
import { Loading } from '@shared/components';

// NOTE: Puede ser utilizado para otras cosas, edicion...
export const UserProvider = ({ children }: IChildrenProps) => {
	const { data, isLoading, isError } = useGetCurrentTeacher();

	const headPositions = useMemo(() => {
		return getHeadPositions(data?.positions);
	}, [data?.positions]);

	if (isLoading) return <Loading />;

	return (
		<UserContext.Provider
			value={{ user: data, headPositions, isLoading, isError }}
		>
			{children}
		</UserContext.Provider>
	);
};
