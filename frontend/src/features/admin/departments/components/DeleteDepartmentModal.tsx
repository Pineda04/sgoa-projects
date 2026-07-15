import { Button, ModalBase } from '@shared';

interface DeleteDepartmentModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	departmentName: string | undefined;
	isPending?: boolean;
}

export const DeleteDepartmentModal = ({
	isOpen,
	onClose,
	onConfirm,
	departmentName,
	isPending = false,
}: DeleteDepartmentModalProps) => {
	return (
		<ModalBase isOpen={isOpen} onClose={onClose}>
			<div className="p-4">
				<p className="text-center text-gray-600 text-lg font-normal leading-relaxed">
					¿Está seguro que desea eliminar el departamento{' '}
					<span className="font-medium text-gray-800">
						&lt;{departmentName}&gt;
					</span>
					?
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
