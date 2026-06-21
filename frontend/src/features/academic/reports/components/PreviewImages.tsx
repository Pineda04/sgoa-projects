import { askDel } from '@shared/utils/delete-action';
import { DocumentMinusIcon } from '@heroicons/react/24/outline';
import { TrashIcon } from 'lucide-react';
import { TVerificationMedia, useDeleteVerificationMediaFile } from '@api/verification-medias';
import { Button } from '@shared/components';

const squareSizes: Record<number, string> = {
	8: 'w-8 h-8',
	12: 'w-12 h-12',
	16: 'w-16 h-16',
	20: 'w-20 h-20',
	24: 'w-24 h-24',
	32: 'w-32 h-32',
	48: 'w-48 h-48',
	64: 'w-64 h-64',
};

const commonClassesSquare = (size: number = 16, othersClasses = '') =>
	`${squareSizes[size] || squareSizes[16]} ${othersClasses}`;

const commonClassesDocs = (size: number = 16, othersClasses: string = '') =>
	`${commonClassesSquare(size)} flex items-center justify-center border rounded font-bold text-xs ${othersClasses}`;

interface IProps {
	reportId: string;
	verificationMedia: TVerificationMedia;
	isRemovable?: boolean;
	sizeSquare?: number;
	children?: React.ReactNode;
}

export const PreviewImages = ({
	reportId,
	verificationMedia,
	children,
	isRemovable = false,
	sizeSquare = 16,
}: IProps) => {
	const { delVerificationMediaFile } =
		useDeleteVerificationMediaFile(reportId);

	const handleDeleteFile = (
		e: React.MouseEvent<HTMLButtonElement, MouseEvent>
	) =>
		askDel(
			e.currentTarget.id,
			'eliminar el archivo',
			delVerificationMediaFile
		);

	return (
		<>
			{/* // NOTE: Se puede usar una libreria para visualizar docs */}
			<div className="flex flex-wrap justify-center items-center space-x-3 p-3 mb-2 gap-2">
				{!verificationMedia ||
				(verificationMedia &&
					!verificationMedia.verificationMediaFiles.length) ? (
					<div
						className={commonClassesDocs(
							sizeSquare,
							'text-red-400 rounded border-2 border-dashed'
						)}
					>
						<DocumentMinusIcon className="w-8 h-8" />
					</div>
				) : (
					verificationMedia.verificationMediaFiles.map(
						({ id, url, public_id }) => {
							let preview;

							if (url.match(/png|jpg|jpeg/)) {
								preview = (
									<img
										src={url}
										alt={public_id}
										className={commonClassesSquare(
											sizeSquare,
											'object-cover rounded border'
										)}
									/>
								);
							}

							if (url.match(/pdf/)) {
								preview = (
									<div
										className={commonClassesDocs(
											sizeSquare,
											'bg-red-100 text-red-600'
										)}
									>
										PDF
									</div>
								);
							}

							if (url.match(/doc|docx/)) {
								preview = (
									<div
										className={commonClassesDocs(
											sizeSquare,
											'text-white bg-blue-400'
										)}
									>
										DOC
									</div>
								);
							}

							if (url.match(/xls|xlsx/)) {
								preview = (
									<div
										className={commonClassesDocs(
											sizeSquare,
											'text-white bg-green-400'
										)}
									>
										DOC
									</div>
								);
							}

							return (
								<Button
									key={id}
									id={id}
									onClick={
										isRemovable
											? handleDeleteFile
											: undefined
									}
									className={commonClassesSquare(
										sizeSquare,
										`relative overflow-hidden group ${isRemovable ? 'cursor-pointer' : ''}`
									)} variant="unstyled"
								>
									{preview}
									{isRemovable && (
										<div className="absolute inset-0 bg-red-400 opacity-0 group-hover:opacity-50 transition flex justify-center items-center">
											<TrashIcon className="size-6 text-white" />
										</div>
									)}
								</Button>
							);
						}
					)
				)}
				{children}
			</div>
		</>
	);
};
