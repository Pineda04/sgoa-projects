import { useGetAllCenters, useGetCenterById } from '@api/centers';
import { TAcademicCommonProps } from '@api/periods';
import { Loading } from '@shared/components';
import { setOptions } from '@shared/utils';

interface CourseDepartmentFilterProps {
	value: string;
	centerId: string;
	onChange: (value: string) => void;
	onCenterChange?: (centerId: string) => void;
}

export const CourseDepartmentFilter = ({
	value,
	centerId = '',
	onChange,
	onCenterChange,
}: CourseDepartmentFilterProps) => {
	const centers = useGetAllCenters();
	const centerInfo = useGetCenterById(centerId);
	const isLoading = [centers, centerInfo].some(q => q.isLoading);

	if (isLoading) return <Loading />;

	return (
		<>
			<div>
				<label
					className="block mb-2 font-semibold text-sm text-foreground"
					htmlFor="center"
				>
					Centro
				</label>
				<select
					id="center"
					name="centerId"
					className="w-full bg-gray-100 shadow-md rounded-md px-3 py-2 outline-none border border-input focus:ring-2 focus:ring-primary/20 transition-colors"
					onChange={e => {
						const newCenterId =
							e.target.options[e.target.selectedIndex].id;

						if (onCenterChange) {
							onCenterChange(newCenterId);
						}
						onChange('');
					}}
					value={centerId}
				>
					<option value="" disabled>
						Seleccione
					</option>
					{centers.data &&
						setOptions<TAcademicCommonProps>(centers.data ?? [])}
				</select>
			</div>
			<div>
				<label className="block mb-2 font-semibold text-sm text-foreground">
					Departamento
				</label>
				<select
					value={value}
					onChange={e => {
						const centerDepartmentId =
							e.target.options[e.target.selectedIndex].id;

						onChange(centerDepartmentId);
					}}
					className="w-full bg-gray-100 shadow-md rounded-md px-3 py-2 outline-none border border-input focus:ring-2 focus:ring-primary/20 transition-colors"
				>
					<option value="">Todos los departamentos</option>
					{centerInfo.data &&
						centerInfo.data.departments.map(
							({ name, centerDepartmentId }) => (
								<option
									key={centerDepartmentId}
									id={centerDepartmentId}
									value={centerDepartmentId}
								>
									{name}
								</option>
							)
						)}
				</select>
			</div>
		</>
	);
};
