import { useState, useEffect } from 'react';
import { FiSave } from 'react-icons/fi';
import { useCreatePosition } from '@api/positions';
import { Button, ModalBase } from '@shared';

interface CreatePositionModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export const CreatePositionModal = ({
	isOpen,
	onClose,
}: CreatePositionModalProps) => {
	const [name, setName] = useState('');
	const { mutate: createPosition, isPending } = useCreatePosition();

	useEffect(() => {
		if (!isOpen) setName('');
	}, [isOpen]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;

		createPosition(
			{ name },
			{
				onSuccess: () => {
					onClose();
				},
				onError: error => {
					console.error('Error al crear:', error);
				},
			}
		);
	};

	return (
		<ModalBase isOpen={isOpen} onClose={onClose}>
			<div className="p-2">
				<h1 className="text-xl font-bold text-slate-800 mb-1">
					Crear Nueva Posición
				</h1>
				<p className="text-xs text-gray-500 mb-5">
					Ingresa el nombre de la nueva posición académica.
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
									: 'Guardar Posición'}
							</span>
						</Button>
					</div>
				</form>
			</div>
		</ModalBase>
	);
};
