import { useState, useEffect } from 'react';
import { FiSave } from 'react-icons/fi';
import { TBuilding, useUpdateBuildingMutation } from '@api/buildings';
import { Button, ESwalIcons, genericAlert, ModalBase } from '@shared';
import { useGetAllCenters } from '@api/centers';

interface EditBuildingModalProps {
	isOpen: boolean;
	onClose: () => void;
	building: TBuilding | null;
}

export const EditBuildingModal = ({
	isOpen,
	onClose,
	building,
}: EditBuildingModalProps) => {
	// 1. Estados locales para los campos del formulario
	const [name, setName] = useState('');
	const [color, setColor] = useState('#ffffff');
	const [floors, setFloors] = useState('');
	const [centerId, setCenterId] = useState('');

	const { mutate: updateBuilding, isPending } = useUpdateBuildingMutation();
	const { data: centersData } = useGetAllCenters();

	// 2. Sincronizar el estado con el edificio seleccionado al abrir el modal
	useEffect(() => {
		if (building) {
			setName(building.name);
			setColor(building.color || '#ffffff');
			setFloors(building.floors || '');
			setCenterId(building.centerId);
		} else {
			setName('');
			setColor('#ffffff');
			setFloors('');
			setCenterId('');
		}
	}, [building, isOpen]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim() || !centerId || !building) return;

		// 3. Petición de actualización del edificio utilizando la mutación de React Query
		updateBuilding(
			{
				id: building.id,
				data: {
					name,
					color: color || null,
					floors: floors || null,
					centerId,
				},
			},
			{
				onSuccess: () => {
					genericAlert(
						'Se ha actualizado el edificio con éxito.',
						ESwalIcons.SUCCESS
					);
					onClose();
				},
				onError: error => {
					console.error('Error al actualizar:', error);
					genericAlert(
						'Ocurrió un error al actualizar el edificio.',
						ESwalIcons.ERROR
					);
				},
			}
		);
	};

	return (
		<ModalBase isOpen={isOpen} onClose={onClose}>
			<div className="p-2">
				<h1 className="text-xl font-bold text-slate-800 mb-1">
					Editar Edificio
				</h1>
				<p className="text-xs text-gray-500 mb-5">
					Modifica los datos del edificio seleccionado.
				</p>

				<form onSubmit={handleSubmit} className="space-y-5">
					{/* Campo: Nombre */}
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Nombre del Edificio
						</label>
						<input
							type="text"
							value={name}
							onChange={e => setName(e.target.value)}
							placeholder="Ej. Edificio 4"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-green-200 focus:border-transparent text-sm"
							required
							disabled={isPending}
						/>
					</div>

					{/* Campo: Color Distintivo */}
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Color Distintivo
						</label>
						<div className="flex items-center gap-3">
							<input
								type="color"
								value={
									/^#[0-9a-fA-F]{6}$/.test(color)
										? color
										: ''
								}
								onChange={e => setColor(e.target.value)}
								className="w-12 h-10 p-0 cursor-pointer shrink-0"
								disabled={isPending}
							/>
							<input
								type="text"
								value={color}
								onChange={e => setColor(e.target.value)}
								placeholder='Ej. #ff5733 o Celeste y azul'
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-green-200 focus:border-transparent text-sm"
								disabled={isPending}
							/>
						</div>
					</div>

					{/* Campo: Pisos */}
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Número de Pisos
						</label>
						<input
							type="number"
							value={floors}
							onChange={e => {
								const val = e.target.value;
								if (val === '' || (Number(val) >= 0 && Number.isInteger(Number(val)))) {
									setFloors(val);
								}
							}}
							min="0"
							step="1"
							placeholder="Ej. 0, 1, 2, 3..."
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-green-200 focus:border-transparent text-sm"
							disabled={isPending}
						/>
					</div>

					{/* Campo: Centro Operativo Relacionado */}
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Centro Vinculado
						</label>
						<select
							value={centerId}
							onChange={e => setCenterId(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-green-200 focus:border-transparent text-sm bg-white"
							required
							disabled={isPending}
						>
							<option value="">Seleccione un centro...</option>
							{centersData?.map(center => (
								<option key={center.id} value={center.id}>
									{center.name}
								</option>
							))}
						</select>
					</div>

					{/* Botones del formulario */}
					<div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isPending}
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
							disabled={isPending}
						>
							{!isPending && <FiSave className="size-4" />}
							<span>
								{isPending
									? 'Guardando...'
									: 'Actualizar Edificio'}
							</span>
						</Button>
					</div>
				</form>
			</div>
		</ModalBase>
	);
};
