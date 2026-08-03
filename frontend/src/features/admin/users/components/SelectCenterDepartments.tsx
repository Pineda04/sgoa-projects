import { TPosition } from '@api/positions';
import { useGetAllMyCoordinations } from '@api/teachers';
import { ICreateUserProps } from '@api/users';
import { Error, Loading } from '@shared/components';
import { getUniqueCenters } from '@shared/utils';
import { useEffect, useState } from 'react';

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

	const uniqueCenters =
		currentUserCoordinationsInfo.data &&
		getUniqueCenters(
			currentUserCoordinationsInfo.data as unknown as TPosition[]
		);

	const positionsByCenter =
		currentUserCoordinationsInfo.data?.filter(
			p => p.center.id === uniqueCenters?.[centerSelected]?.id
		) ?? [];

	useEffect(() => {
		if (uniqueCenters && uniqueCenters.length > 0) {
			const currentCenter = uniqueCenters[centerSelected] || uniqueCenters[0];
			if (!values.centerId || values.centerId !== currentCenter.id) {
				setValues(prev => ({
					...prev,
					centerId: currentCenter.id,
				}));
			}
		}
	}, [uniqueCenters, centerSelected, values.centerId, setValues]);

	useEffect(() => {
		if (positionsByCenter && positionsByCenter.length > 0) {
			const firstDeptId = positionsByCenter[0].centerDepartmentId;
			const isCurrentValid = positionsByCenter.some(
				p => p.centerDepartmentId === values.centerDepartmentId
			);
			if (!values.centerDepartmentId || !isCurrentValid) {
				setValues(prev => ({
					...prev,
					centerDepartmentId: firstDeptId,
				}));
			}
		}
	}, [positionsByCenter, values.centerDepartmentId, setValues]);
	if (isLoading) return <Loading />;

	const selectedCenterIndex =
		uniqueCenters?.findIndex(c => c.id === values.centerId) ?? 0;

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
					value={selectedCenterIndex >= 0 ? selectedCenterIndex : 'select'}
					onChange={e => {
						const index = Number(e.target.value);
						const center = uniqueCenters?.[index];
						if (center) {
							setCenterSelected(index);
							setValues(prev => ({
								...prev,
								centerId: center.id,
							}));
						}
					}}
					onBlur={handleBlur}
				>
					<option value="select" disabled>
						Seleccione
					</option>
					{uniqueCenters?.map((center, index) => (
						<option key={center.id} value={index}>
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
					name="centerDepartmentId"
					className="w-full bg-gray-100 shadow-md rounded-md px-2 py-2 outline-none"
					value={values.centerDepartmentId || 'select'}
					onChange={e => {
						const centerDepartmentId = e.target.value;
						setValues(prev => ({
							...prev,
							centerDepartmentId,
						}));
					}}
					onBlur={handleBlur}
				>
					<option value="select" disabled>
						Seleccione
					</option>
					{positionsByCenter?.map(
						({ centerDepartmentId, department }) => (
							<option
								key={centerDepartmentId}
								value={centerDepartmentId}
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
