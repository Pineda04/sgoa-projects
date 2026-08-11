import { useGetAllRoles } from '@api/roles';
import { RoleTable } from '../components';

export const ListRoles = () => {
	const roles = useGetAllRoles();

	return (
		<div className="pb-8 sm:pb-12">
			{roles.isError ? (
				<p className="text-sm text-red-500">
					Error al cargar los roles. Intenta nuevamente.
				</p>
			) : (
				<RoleTable
					data={roles.data ?? []}
					isLoading={roles.isLoading}
				/>
			)}
		</div>
	);
};
