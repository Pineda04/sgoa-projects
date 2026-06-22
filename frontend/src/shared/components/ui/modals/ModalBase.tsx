import type React from 'react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../button';

const portalRoot = document.getElementById('portal-root') ?? document.body;

interface IModal {
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
}

export const ModalBase = ({ isOpen, onClose, children }: IModal) => {
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}

		return () => {
			document.body.style.overflow = '';
		};
	}, [isOpen]);

	if (!isOpen) return null;

	const modal = (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xl"
			onClick={e => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<div className="bg-white rounded-lg shadow-2xl p-6 lg:max-w-5xl w-full relative m-10 max-h-[90vh] overflow-auto">
				<Button
					className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer z-40"
					onClick={onClose}
					variant="unstyled"
				>
					&#x2715;
				</Button>
				{children}
			</div>
		</div>
	);

	return createPortal(modal, portalRoot);
};
