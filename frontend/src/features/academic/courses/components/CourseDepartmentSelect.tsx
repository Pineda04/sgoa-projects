import { useGetAllDepartments } from '@api/departments';
import { useAbility } from '@config';
import { useUser } from '@config/providers';
import { Loading } from '@shared/components';

interface CourseDepartmentSelectProps {
	value: string;
	onChange: (departmentId: string) => void;
	disabled?: boolean;
	error?: string;
	touched?: boolean;
}

export const CourseDepartmentSelect = ({
	value,
	onChange,
	disabled = false,
	error,
	touched,
}: CourseDepartmentSelectProps) => {
	const ability = useAbility();
	const { headPositions, isLoading: isLoadingUser } = useUser();
	const departmentsQuery = useGetAllDepartments();

	const canManageDepartments = ability.can('manage', 'departments');
	const canUpdateDepartments = ability.can('update', 'departments');
	const canReadDepartments =
		ability.can('read', 'departments') &&
		!canManageDepartments &&
		!canUpdateDepartments;

	const isLoadingCoordinator = isLoadingUser;
	const isLoadingDepartments = departmentsQuery.isLoading;

	const isLoading = canReadDepartments
		? isLoadingCoordinator
		: isLoadingDepartments;

	if (isLoading) return <Loading />;

	if (!ability.can('read', 'departments')) {
		return (
			<div className="md:col-span-2 space-y-2">
				<p className="text-sm text-muted-foreground">
					No tiene permisos para crear asignaturas.
				</p>
			</div>
		);
	}

	type DepartmentOption = {
		id: string;
		name: string;
		coordinations?: { coordinator: string; center: string }[];
	};

	const getDepartments = (): DepartmentOption[] => {
		if (canReadDepartments) {
			return headPositions.map(p => ({
				id: p.department.id,
				name: p.department.name,
			}));
		}

		const allDepartments = departmentsQuery.data ?? [];
		return allDepartments.map(d => ({
			id: d.id,
			name: d.name,
			coordinations: d.coordinations.map(c => ({
				coordinator: c.coordinator?.name ?? 'Sin coordinador',
				center: c.centerName,
			})),
		}));
	};

	const departments = getDepartments();

	const formatCoordination = (coord: {
		coordinator: string;
		center: string;
	}) => {
		return `${coord.coordinator} - ${coord.center}`;
	};

	return (
		<div className="md:col-span-2 space-y-2">
			<label
				htmlFor="departmentId"
				className="text-sm font-medium text-foreground"
			>
				Departamento
			</label>
			<select
				id="departmentId"
				value={value}
				onChange={e => onChange(e.target.value)}
				disabled={disabled}
				className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:text-muted-foreground"
			>
				<option value="">Seleccione un departamento</option>
				{departments.map(dept => (
					<option key={dept.id} value={dept.id}>
						{canReadDepartments
							? dept.name
							: dept.name +
								(dept.coordinations &&
								dept.coordinations.length > 0
									? ` (${dept.coordinations.map(formatCoordination).join(', ')})`
									: ' (Sin coordinador)')}
					</option>
				))}
			</select>
			{touched && error ? (
				<p className="text-xs text-destructive">{error}</p>
			) : null}
			<p className="text-xs text-muted-foreground mt-2">
				<strong>Nota:</strong> Las clases que se creen se compartirán
				con todos los centros. Si cambia el estado a inactivo/a, se
				cambiará en todos los centros por igual.
			</p>
		</div>
	);
};
