import { Button, ModalBase } from '@shared';

interface DeleteAirConditionerModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	classroomName?: string | null;
	buildName?: string | null;
	centerName?: string | null;
	isPending?: boolean;
}

export const DeleteAirConditionerModal = ({
	isOpen,
	onClose,
	onConfirm,
	classroomName,
	buildName,
	centerName,
	isPending = false,
}: DeleteAirConditionerModalProps) => {
	return (
		<ModalBase isOpen={isOpen} onClose={onClose}>
			<div className="p-4">
				<p className="text-center text-gray-600 text-lg font-normal leading-relaxed">
					¿Estás seguro que quieres eliminar el aire acondicionado
					ubicado en{' '}
					<span className="font-medium text-gray-800">
						{classroomName ?? '—'}
					</span>{' '}
					de{' '}
					<span className="font-medium text-gray-800">
						{buildName ?? '—'}
					</span>{' '}
					en{' '}
					<span className="font-medium text-gray-800">
						{centerName ?? '—'}
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
