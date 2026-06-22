import { useState, useEffect } from 'react';
import { FiSave } from 'react-icons/fi';
import { useUpdateCenterMutation } from '@api/centers';
import { Button, ESwalIcons, genericAlert, ModalBase } from '@shared';

interface EditCenterModalProps {
	isOpen: boolean;
	onClose: () => void;
	center: { id: string; name: string } | null;
}

export const EditCenterModal = ({
	isOpen,
	onClose,
	center,
}: EditCenterModalProps) => {
	const [name, setName] = useState('');
	const { mutate: updateCenter, isPending } = useUpdateCenterMutation();

	// Precargar el input con el nombre del centro seleccionado al abrir el modal
	useEffect(() => {
		if (center) {
			setName(center.name);
		} else {
			setName('');
		}
	}, [center, isOpen]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim() || !center) return;

		updateCenter(
			{ id: center.id, data: { name } },
			{
				onSuccess: () => {
					genericAlert(
						'Se ha actualizado el centro operativo con éxito.',
						ESwalIcons.SUCCESS
					);
					onClose();
				},
				onError: error => {
					console.error('Error al actualizar:', error);
				},
			}
		);
	};

	return (
		<ModalBase isOpen={isOpen} onClose={onClose}>
			<div className="p-2">
				<h1 className="text-xl font-bold text-slate-800 mb-1">
					Editar Centro Operativo
				</h1>
				<p className="text-xs text-gray-500 mb-5">
					Modifica el nombre del centro seleccionado.
				</p>

				<form onSubmit={handleSubmit} className="space-y-5">
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Nombre del Centro
						</label>
						<input
							type="text"
							value={name}
							onChange={e => setName(e.target.value)}
							placeholder="Ej. Centro Universitario Regional"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-green-200 focus:border-transparent text-sm"
							required
							disabled={isPending}
						/>
					</div>

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
									: 'Actualizar Centro'}
							</span>
						</Button>
					</div>
				</form>
			</div>
		</ModalBase>
	);
};
