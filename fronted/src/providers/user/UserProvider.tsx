import { IChildrenProps } from '@types';
import { UserContext } from './UserContext';
import { Loading } from '@components';
import { useGetCurrentTeacher } from '@features/teachers';
import { getHeadPositions } from '@utils/user';
import { useMemo } from 'react';

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
