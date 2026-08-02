import { useState, useEffect } from 'react';
import { FiSave } from 'react-icons/fi';
import { useUpdatePosition } from '@api/positions';
import { TOutputPosition } from '@api/positions';
import { Button, ModalBase } from '@shared';

interface EditPositionModalProps {
	isOpen: boolean;
	onClose: () => void;
	position: TOutputPosition | null;
}

export const EditPositionModal = ({
	isOpen,
	onClose,
	position,
}: EditPositionModalProps) => {
	const [name, setName] = useState('');
	const { updatePosition, isPendingUpdate: isPending } = useUpdatePosition(
		position?.id ?? ''
	);

	useEffect(() => {
		if (position) {
			setName(position.name);
		} else {
			setName('');
		}
	}, [position, isOpen]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim() || !position) return;

		updatePosition({ name })
			.then(() => {
				onClose();
			})
			.catch(error => {
				console.error('Error al actualizar:', error);
			});
	};

	return (
		<ModalBase isOpen={isOpen} onClose={onClose}>
			<div className="p-2">
				<h1 className="text-xl font-bold text-slate-800 mb-1">
					Editar Posición Académica
				</h1>
				<p className="text-xs text-gray-500 mb-5">
					Modifica el nombre de la posición seleccionada.
				</p>

				<form onSubmit={handleSubmit} className="space-y-5">
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Nombre de la Posición
						</label>
						<input
							type="text"
							value={name}
							onChange={e => setName(e.target.value)}
							placeholder="Ej. Director Académico"
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
									: 'Actualizar Posición'}
							</span>
						</Button>
					</div>
				</form>
			</div>
		</ModalBase>
	);
};
