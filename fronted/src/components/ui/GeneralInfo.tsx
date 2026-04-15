import { Loading } from './Loading';
import { useGetCurrentAcademicPeriod } from '@features/shared/academic';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUser } from '@providers/user';

export const GeneralInfo = () => {
	const currentUser = useUser();
	const academicPeriodInfo = useGetCurrentAcademicPeriod();

	const isLoading = [currentUser, academicPeriodInfo].some(q => q.isLoading);

	const [params, setParams] = useSearchParams();
	const centerDepartmentIdParam = params.get('centerDepartmentId');

	const [selectedHead, setSelectedHead] = useState(
		centerDepartmentIdParam || ''
	);

	// Filtrar posiciones donde sea Jefe de Departamento

	useEffect(() => {
		if (currentUser.headPositions.length > 0 && !selectedHead) {
			const defaultId = currentUser.headPositions[0].centerDepartmentId;

			setSelectedHead(defaultId);
			setParams({ centerDepartmentId: defaultId });
		}
	}, [currentUser.headPositions, selectedHead, setParams]);

	const handleChange = (value: string) => {
		setSelectedHead(value);
		setParams({ centerDepartmentId: value });
	};

	if (isLoading) return <Loading />;

	const currentCenter = currentUser.headPositions.find(
		p => p.centerDepartmentId === selectedHead
	)?.center.name;

	return (
		<div className="px-8 py-6">
			<h2 className="text-2xl font-semibold">
				{currentCenter ?? '---'} PAC {academicPeriodInfo.data?.title}
			</h2>
			<p className="text-sm">{currentUser.user?.name}</p>
			<p className="text-sm">{currentUser.user?.code}</p>
			<p className="text-sm">{currentUser.user?.email || ''}</p>

			{currentUser.headPositions.length > 0 && (
				<div className="mt-4">
					<label className="block text-sm font-semibold text-gray-600 mb-2">
						Cargos de Jefe de Departamento
					</label>
					<select
						className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 shadow-sm outline-none cursor-pointer"
						value={selectedHead}
						onChange={e => handleChange(e.target.value)}
					>
						{currentUser.headPositions.map(p => (
							<option
								key={p.centerDepartmentId}
								value={p.centerDepartmentId}
							>
								{p.department.name} | {p.center.name}
							</option>
						))}
					</select>
				</div>
			)}
		</div>
	);
};
