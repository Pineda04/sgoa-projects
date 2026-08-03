import Select, { StylesConfig } from 'react-select';
import { useState } from 'react';
import { EUserRole } from '@shared/constants';
import { ICreateUserProps } from '@api/users';
import { useGetAllPositions } from '@api/positions';
import { useGetAllCenters, useGetCenterById } from '@api/centers';
import { Error, Loading } from '@shared/components';
import { setOptions } from '@shared/utils';
import { TAcademicCommonProps } from '@api/periods';

const customStyles: StylesConfig = {
	control: (base, state) => ({
		...base,
		backgroundColor: '#f3f4f6', // bg-gray-100
		borderRadius: '0.5rem', // rounded-lg
		borderColor: state.isFocused ? '#2563eb' : '#e5e7eb', // focus:blue-600 else:gray-200
		boxShadow: state.isFocused
			? '0 0 0 1px #2563eb'
			: '0 3px 3px rgba(0, 0, 0, 0.1)', // shadow-md
		paddingLeft: '2px',
		paddingRight: '0',
		minHeight: '40px',
		width: '100%',
		color: '#111827',
		cursor: 'pointer',
		justifyContent: 'space-between',
		'&:hover': {
			borderColor: '#d1d5db', // hover:border-gray-300
		},
	}),
	placeholder: base => ({
		...base,
		color: '#000000',
	}),
	indicatorSeparator: () => ({
		display: 'none',
	}),
	indicatorsContainer: base => ({
		...base,
		':nth-child(2)>div': {
			padding: '0',
			svg: {
				width: '15px',
				stroke: 'none',
				strokeWidth: '1',
			},
		},
	}),
	dropdownIndicator: base => ({
		...base,
		color: '#000000', // text-gray-400
		marginLeft: 'auto',
		'&:hover': {
			color: '#6b7280', // text-gray-500
		},
	}),
	multiValue: base => ({
		...base,
		backgroundColor: '#e5e7eb', // gray-200
	}),
	multiValueLabel: base => ({
		...base,
		color: '#374151', // gray-700
	}),
	multiValueRemove: base => ({
		...base,
		color: '#6b7280',
		':hover': {
			backgroundColor: '#d1d5db',
			color: '#111827',
		},
	}),
};

const rolesAvailables = [
	EUserRole.DIRECCION,
	EUserRole.RRHH,
	EUserRole.COORDINADOR_AREA,
	EUserRole.DOCENTE,
	EUserRole.MONITOR,
].map(r => ({
	value: r,
	label: r,
}));

export const SelectAccessRoles = ({
	touched,
	values,
	setValues,
	errors,
	handleBlur,
}: ICreateUserProps) => {
	const positions = useGetAllPositions();
	const centers = useGetAllCenters();
	const [centerId, setCenterId] = useState<string>('');
	const centerInfo = useGetCenterById(centerId);
	const isLoading = [positions, centers, centerInfo].some(q => q.isLoading);

	return (
		<>
			{isLoading && <Loading />}
			<div className="mt-6">
				<label className="block mb-2 font-bold" htmlFor="center">
					Centro
				</label>
				<select
					id="center"
					name="centerId"
					className="w-full bg-gray-100 shadow-md rounded-lg px-2 py-2 outline-none"
					onChange={e => {
						const centerId =
							e.target.options[e.target.selectedIndex].id;
						setCenterId(centerId);
						setValues({
							...values,
							centerId,
						});
					}}
					onBlur={handleBlur}
					defaultValue={'select'}
				>
					<option value="select" disabled>
						Seleccione
					</option>
					{centers.data &&
						setOptions<TAcademicCommonProps>(
							(centers.data && centers.data) ?? []
						)}
				</select>
				{touched.centerId && errors.centerId && (
					<Error error={errors.centerId} />
				)}
			</div>

			<div className={`mt-6 ${centerId === '' && 'pointer-events-none'}`}>
				<label className="block mb-2 font-bold" htmlFor="department">
					Departamento
				</label>
				<select
					id="department"
					name="center-departments"
					className="w-full bg-gray-100 shadow-md rounded-lg px-2 py-2 outline-none"
					onChange={e => {
						const centerDepartmentId =
							e.target.options[e.target.selectedIndex].id;
						setValues({
							...values,
							centerDepartmentId,
						});
					}}
					onBlur={handleBlur}
					defaultValue={'select'}
				>
					<option value="select" disabled>
						Seleccione
					</option>
					{centerInfo.data &&
						centerInfo.data.departments.map(
							({ name, centerDepartmentId }) => (
								<option
									key={centerDepartmentId}
									id={centerDepartmentId}
									value={name}
								>
									{name}
								</option>
							)
						)}
				</select>
				{touched.centerDepartmentId && errors.centerDepartmentId && (
					<Error error={errors.centerDepartmentId} />
				)}
			</div>

			<div className="mt-6">
				<label className="block mb-2 font-bold" htmlFor="position">
					Cargo académico
				</label>
				<select
					id="position"
					name="positionId"
					className="w-full bg-gray-100 shadow-md rounded-lg px-2 py-2 outline-none"
					onChange={e => {
						const position =
							e.target.options[e.target.selectedIndex];
						setValues({
							...values,
							positionId: position.id,
							positionName: position.value,
						});
					}}
					onBlur={handleBlur}
					defaultValue={'select'}
				>
					<option value="select" disabled>
						Seleccione
					</option>
					{positions.data &&
						setOptions<TAcademicCommonProps>(
							(positions.data && positions.data) ?? []
						)}
				</select>
				{touched.positionId && errors.positionId && (
					<Error error={errors.positionId} />
				)}
			</div>

			<div className="mt-6">
				<label className="block mb-2 font-bold" htmlFor="roles">
					Roles de accesso
				</label>
				<Select
					name="roles"
					options={rolesAvailables}
					isMulti
					isSearchable={false}
					styles={customStyles}
					placeholder="Seleccione"
					onChange={valuesSelected => {
						const roles = valuesSelected.map(
							v => (v as { value: string; label: string }).value
						);

						setValues({
							...values,
							roles,
						});
					}}
				/>
				{touched.roles && errors.roles && (
					<Error error={errors.roles} breakLine={false} />
				)}
			</div>
		</>
	);
};
