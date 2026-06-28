import { TPosition } from '@api/positions';
import { useGetAllMyCoordinations } from '@api/teachers';
import { ICreateUserProps } from '@api/users';
import { Error, Loading } from '@shared/components';
import { getUniqueCenters } from '@shared/utils';
import { useState } from 'react';

export const SelectCenterDepartments = ({
	touched,
	values,
	setValues,
	errors,
	handleBlur,
}: ICreateUserProps) => {
	const currentUserCoordinationsInfo = useGetAllMyCoordinations();
	const [centerSelected, setCenterSelected] = useState(0);
	const isLoading = [currentUserCoordinationsInfo].some(q => q.isLoading);

	if (isLoading) return <Loading />;

	const uniqueCenters =
		currentUserCoordinationsInfo.data &&
		getUniqueCenters(
			currentUserCoordinationsInfo.data as unknown as TPosition[]
		);

	const positionsByCenter =
		currentUserCoordinationsInfo.data?.filter(
			p => p.center.id === uniqueCenters?.[centerSelected]?.id
		) ?? [];

	return (
		<>
			<div className="mt-6">
				<label className="block mb-2 font-bold" htmlFor="center">
					Centro
				</label>
				<select
					id="center"
					name="centerId"
					className="w-full bg-gray-100 shadow-md rounded-md px-2 py-2 outline-none"
					onChange={e => {
						const centerId =
							e.target.options[e.target.selectedIndex].id;
						setValues({
							...values,
							centerId,
						});
						setCenterSelected(Number(e.target.value));
					}}
					onBlur={handleBlur}
					defaultValue={'select'}
				>
					<option value="select" disabled>
						Seleccione
					</option>
					{uniqueCenters?.map((center, index) => (
						<option key={center.id} id={center.id} value={index}>
							{center.name}
						</option>
					))}
				</select>
				{touched.centerId && errors.centerId && (
					<Error error={errors.centerId} />
				)}
			</div>

			<div className={`mt-6`}>
				<label className="block mb-2 font-bold" htmlFor="department">
					Departamento
				</label>
				<select
					id="department"
					name="center-departments"
					className="w-full bg-gray-100 shadow-md rounded-md px-2 py-2 outline-none"
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
					{positionsByCenter &&
						positionsByCenter.map(
							({ centerDepartmentId, department }) => (
								<option
									key={centerDepartmentId}
									id={centerDepartmentId}
									value={department.name}
								>
									{department.name}
								</option>
							)
						)}
				</select>
				{touched.centerDepartmentId && errors.centerDepartmentId && (
					<Error error={errors.centerDepartmentId} />
				)}
			</div>
		</>
	);
};
