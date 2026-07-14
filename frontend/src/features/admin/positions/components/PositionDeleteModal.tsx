import { Button, ModalBase } from '@shared';
import { TOutputPosition } from '@api/positions';

interface PositionDeleteModalProps {
	isOpen: boolean;
	onClose: () => void;
	position?: TOutputPosition;
	onConfirm: () => Promise<void> | void;
	isPending?: boolean;
}

export const PositionDeleteModal = ({
	isOpen,
	onClose,
	position,
	onConfirm,
	isPending = false,
}: PositionDeleteModalProps) => {
	return (
		<ModalBase isOpen={isOpen} onClose={onClose}>
			<div className="p-6 w-full max-w-md">
				<h2 className="text-xl font-semibold mb-4">Eliminar posición</h2>
				<p className="text-sm text-gray-600">
					¿Desea eliminar la posición <strong>{position?.name}</strong>?
				</p>
				<div className="flex justify-end gap-3 mt-6">
					<Button type="button" onClick={onClose} className="bg-gray-300 text-gray-700">
						Cancelar
					</Button>
					<Button type="button" onClick={onConfirm} className="bg-[#DC3545] text-white">
						{isPending ? 'Eliminando...' : 'Eliminar'}
					</Button>
				</div>
			</div>
		</ModalBase>
	);
};
