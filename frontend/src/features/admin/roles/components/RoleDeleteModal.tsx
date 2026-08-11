import { Button, ModalBase } from '@shared';

interface RoleDeleteModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	roleName: string | undefined;
	isPending?: boolean;
}

export const RoleDeleteModal = ({
	isOpen,
	onClose,
	onConfirm,
	roleName,
	isPending = false,
}: RoleDeleteModalProps) => {
	return (
		<ModalBase isOpen={isOpen} onClose={onClose}>
			<div className="p-4">
				<p className="text-center text-gray-600 text-lg font-normal leading-relaxed">
					¿Está seguro que desea eliminar el rol{' '}
					<span className="font-medium text-gray-800">
						&lt;{roleName}&gt;
					</span>
					?
				</p>
				<p className="text-center text-xs text-gray-400 mt-2">
					Si el rol tiene usuarios asignados no podrá eliminarse.
				</p>

				<div className="flex flex-row justify-center items-center gap-4 mt-6">
					<Button
						onClick={onConfirm}
						disabled={isPending}
						className="bg-[#d93843] hover:bg-red-600 text-white font-medium px-6 py-2 rounded-lg min-w-20 transition-all cursor-pointer disabled:bg-gray-400"
						variant="unstyled"
					>
						{isPending ? '...' : 'Sí'}
					</Button>
					<Button
						onClick={onClose}
						disabled={isPending}
						className="bg-[#6b7280] hover:bg-slate-600 text-white font-medium px-6 py-2 rounded-lg min-w-20 transition-all cursor-pointer"
						variant="unstyled"
					>
						No
					</Button>
				</div>
			</div>
		</ModalBase>
	);
};
