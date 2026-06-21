import { useGetCurrentAcademicPeriod } from '@api/periods';
import { useUser } from '@config/providers';
import { Loading } from '@shared/components';
import { useEffect, useState } from 'react';

export const InfoTeacher = () => {
	const currentUser = useUser();
	const academicPeriodInfo = useGetCurrentAcademicPeriod();
	const isLoading = [currentUser, academicPeriodInfo].some(q => q.isLoading);
	const [selectedPosition, setSelectedPosition] = useState('');

	useEffect(() => {
		if (
			currentUser.user &&
			currentUser.user.positions.length > 0 &&
			!selectedPosition
		) {
			const defaultId = currentUser.user.positions[0].centerDepartmentId;

			setSelectedPosition(defaultId);
		}
	}, [currentUser.user, selectedPosition]);

	const handleChange = (value: string) => {
		setSelectedPosition(value);
	};

	if (isLoading) return <Loading />;

	const currentCenter = currentUser.user?.positions.find(
		p => p.centerDepartmentId === selectedPosition
	)?.center.name;

	return (
		<div className="mb-6">
			<h2 className="text-2xl font-semibold mb-2">
				{currentCenter ?? '---'} PAC {academicPeriodInfo.data?.title}
			</h2>
			<p className="text-sm">{currentUser.user?.name}</p>
			<p className="text-sm">{currentUser.user?.code}</p>
			<p className="text-sm">{currentUser.user?.email || ''}</p>

			{currentUser.user && (
				<div className="mt-4">
					<label className="block text-sm font-semibold text-gray-600 mb-2">
						Cargos académicos asociados
					</label>
					<select
						className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 shadow-sm outline-none cursor-pointer w-full sm:w-fit max-w-full"
						value={selectedPosition}
						onChange={e => handleChange(e.target.value)}
					>
						{currentUser.user?.positions.map(p => (
							<option
								key={p.centerDepartmentId}
								value={p.centerDepartmentId}
							>
								{p.center.name} | {p.department.name} |{' '}
								{p.position.name}
							</option>
						))}
					</select>
				</div>
			)}
		</div>
	);
};
