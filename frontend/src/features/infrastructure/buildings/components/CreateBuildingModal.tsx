import { useState, useEffect } from 'react';
import { FiSave } from 'react-icons/fi';
import { useCreateBuildingMutation } from '@api/buildings';
import { Button, ESwalIcons, genericAlert, ModalBase } from '@shared';
import { useGetAllCenters } from '@api/centers';

interface CreateBuildingModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export const CreateBuildingModal = ({
	isOpen,
	onClose,
}: CreateBuildingModalProps) => {
	//1. estados nativos controlados para cada campo del modelo de Prisma
	const [name, setName] = useState('');
	const [color, setColor] = useState('#ffffff');
	const [floors, setFloors] = useState('');
	const [centerId, setCenterId] = useState('');

	const { mutate: createBuilding, isPending } = useCreateBuildingMutation();
	const { data: centersData } = useGetAllCenters();

	// 2. Limpiar todos los campos cada vez que el modal se abre o cierra
	useEffect(() => {
		if (!isOpen) {
			setName('');
			setColor('#ffffff');
			setFloors('');
			setCenterId('');
		}
	}, [isOpen]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim() || !centerId) return;

		// 3. Mutación idéntica al estándar pasando { name, color, floors, centerId }
		createBuilding(
			{
				name,
				color: color || null,
				floors: floors || null,
				centerId,
			},
			{
				onSuccess: () => {
					genericAlert(
						'Se ha guardado el edificio con éxito.',
						ESwalIcons.SUCCESS
					);
					onClose();
				},
				onError: error => {
					console.error('Error al crear:', error);
					genericAlert(
						'Ocurrió un error al guardar el edificio.',
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
					Crear Nuevo Edificio
				</h1>
				<p className="text-xs text-gray-500 mb-5">
					Ingresa los datos para registrar el edificio en la
					infraestructura.
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
							placeholder="Ej. Edificio 1 (Administrativo)"
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

					{/* Campo: Pisos  */}
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

					{/* Campo: Selector de Centro Operativo */}
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
									: 'Guardar Edificio'}
							</span>
						</Button>
					</div>
				</form>
			</div>
		</ModalBase>
	);
};
