import { useGetCurrentAcademicPeriod } from '@api/periods';
import { useUser } from '@config/providers';
import { Loading } from '@shared/components';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface InfoCoordinatorProps {
	centerDepartmentId?: string;
}

export const InfoCoordinator = ({
	centerDepartmentId: propCenterDepartmentId,
}: InfoCoordinatorProps) => {
	const navigate = useNavigate();
	const paramsCenterDepartmentId = useParams().centerDepartmentId;
	const centerDepartmentId = propCenterDepartmentId ?? paramsCenterDepartmentId;
	const currentUser = useUser();
	const academicPeriodInfo = useGetCurrentAcademicPeriod();
	const isLoading = [currentUser, academicPeriodInfo].some(q => q.isLoading);
	const validIds = currentUser.headPositions.map(p => p.centerDepartmentId);
	const isValidId =	centerDepartmentId && validIds.includes(centerDepartmentId);
	const effectiveId = isValidId ? centerDepartmentId : undefined;

	// Redirigir solo si NO hay ID en URL y SÍ hay al menos un cargo disponible
	useEffect(() => {
		if (!centerDepartmentId && currentUser.headPositions.length > 0) {
			const defaultId = currentUser.headPositions[0].centerDepartmentId;

			navigate(`/dashboard/coordinator/${defaultId}`, {
				replace: true,
			});
		}
	}, [centerDepartmentId, currentUser.headPositions, navigate]);

	if (isLoading) return <Loading />;

	if (centerDepartmentId && !isValidId) {
		return (
			<div className="px-8 py-6 text-red-600">
				El departamento seleccionado no está autorizado para este usuario.
			</div>
		);
}

	const currentPosition = currentUser.headPositions.find(
		p => p.centerDepartmentId === effectiveId
	);

	const currentCenter = currentPosition?.center.name ?? '---';
	const currentDepartment = currentPosition?.department.name ?? '';

	return (
		<div className="mb-6">
			<h2 className="text-2xl font-semibold mb-2">
				{currentCenter}{' '}
				{currentDepartment ? `| ${currentDepartment}` : ''} - PAC{' '}
				{academicPeriodInfo.data?.title ?? '...'}
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
						className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 shadow-sm outline-none cursor-pointer w-full sm:w-fit max-w-full"
						value={effectiveId ?? ''}
						onChange={e => {
							const newId = e.target.value;
							navigate(
								`/dashboard/coordinator/${newId}`
							);
						}}
					>
						<option value="" disabled>
							Seleccione un cargo...
						</option>
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
