import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { FiPlus, FiSave } from 'react-icons/fi';
import { Button, ModalBase } from '@shared';
import { Can, useAbility, type Subjects } from '@config/lib';
import { PencilSquareIcon, TrashIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import { alertError, genericAlert } from '@shared/utils';

interface CatalogItem {
	id: string | null;
	value: string;
	deleted?: boolean;
}

interface CatalogCrudModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	description: string;
	subject: Subjects;
	fieldKey: string;
	initialData?: Array<{ id: string; [key: string]: string }>;
	isLoading: boolean;
	onSave: (
		createItems: Array<{ value: string }>,
		updateItems: Array<{ id: string; value: string }>,
		deleteIds: string[]
	) => Promise<void>;
}

export const CatalogCrudModal = ({
	isOpen,
	onClose,
	title,
	description,
	subject,
	fieldKey,
	initialData,
	isLoading,
	onSave,
}: CatalogCrudModalProps) => {
	const ability = useAbility();
	const canWrite =
		ability.can('create', subject) ||
		ability.can('update', subject) ||
		ability.can('delete', subject);

	const [items, setItems] = useState<CatalogItem[]>([]);
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const originalRef = useRef('');
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (isOpen && initialData) {
			const mapped = initialData.map(item => ({
				id: item.id,
				value: item[fieldKey] || '',
			}));
			setItems(mapped);
			originalRef.current = JSON.stringify(mapped);
			setEditingIndex(null);
		}
	}, [isOpen, initialData, fieldKey]);

	useEffect(() => {
		if (editingIndex !== null) {
			inputRef.current?.focus();
		}
	}, [editingIndex]);

	const hasChanges = useMemo(() => {
		return JSON.stringify(items) !== originalRef.current;
	}, [items]);

	const hasEmptyValue = useMemo(
		() => items.some(i => !i.deleted && !i.value.trim()),
		[items]
	);

	const handleValueChange = useCallback((index: number, value: string) => {
		setItems(prev => {
			const next = [...prev];
			next[index] = { ...next[index], value };
			return next;
		});
	}, []);

	const handleAdd = useCallback(() => {
		const newIndex = items.length;
		setItems(prev => [...prev, { id: null, value: '' }]);
		setEditingIndex(newIndex);
	}, [items.length]);

	const handleDelete = useCallback((index: number) => {
		setItems(prev => {
			const next = [...prev];
			next[index] = { ...next[index], deleted: true };
			return next;
		});
		setEditingIndex(prev => (prev === index ? null : prev));
	}, []);

	const handleRestore = useCallback((index: number) => {
		setItems(prev => {
			const next = [...prev];
			next[index] = { ...next[index], deleted: false };
			return next;
		});
	}, []);

	const handleStartEdit = useCallback((index: number) => {
		setEditingIndex(index);
	}, []);

	const handleSave = async () => {
		const original: CatalogItem[] = JSON.parse(originalRef.current);
		const originalMap = new Map(
			original.filter(i => i.id).map(i => [i.id!, i])
		);

		const activeItems = items.filter(i => !i.deleted);

		const createItems = activeItems
			.filter(i => !i.id)
			.map(i => ({ value: i.value }));

		const updateItems = activeItems
			.filter(i => i.id && i.value !== originalMap.get(i.id!)?.value)
			.map(i => ({ id: i.id!, value: i.value }));

		const deleteIds = items
			.filter(i => i.id && i.deleted)
			.map(i => i.id!);

		if (
			createItems.length === 0 &&
			updateItems.length === 0 &&
			deleteIds.length === 0
		) {
			return;
		}

		if (hasEmptyValue) return;

		setIsSaving(true);
		try {
			await onSave(createItems, updateItems, deleteIds);

			setIsSaving(false);
			genericAlert('Cambios guardados correctamente');
			onClose();
		} catch (error) {
			await alertError(error);
			setIsSaving(false);
		}
	};

	const handleCancel = () => {
		if (hasChanges) {
			const original: CatalogItem[] = JSON.parse(originalRef.current);
			setItems(original);
		}
		setEditingIndex(null);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<ModalBase isOpen={isOpen} onClose={handleCancel}>
			<div className="flex flex-col h-full">
				<div className="mb-6">
					<h2 className="text-xl font-bold text-slate-800">
						{title}
					</h2>
					<p className="text-sm text-gray-500 mt-0.5">
						{description}
					</p>
				</div>

				<div className="flex-1 min-h-0">
					<Can action="read" subject={subject}>
						{({ isAllowed }) =>
							isAllowed ? (
								<>
									{isLoading ? (
										<div className="flex items-center justify-center py-12">
											<div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
										</div>
									) : items.length === 0 ? (
										<div className="text-center py-12 text-gray-400 text-sm">
											No hay registros disponibles
										</div>
									) : (
										<div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
											{items.map((item, index) => {
												const isEditing =
													editingIndex === index;
												return (
												<div
													key={
														item.id ??
														`new-${index}`
													}
													className={`flex items-center gap-2 rounded-sm px-3 py-2 ${item.deleted ? 'bg-gray-100/50' : 'bg-gray-100'}`}
												>
													<div className="flex-1 min-w-0">
														{isEditing ? (
															<input
																ref={
																	inputRef
																}
																type="text"
																value={
																	item.value
																}
																onChange={e =>
																	handleValueChange(
																		index,
																		e
																			.target
																			.value
																	)
																}
																onBlur={() =>
																	setEditingIndex(
																		null
																	)
																}
																onKeyDown={e => {
																	if (
																		e.key ===
																		'Enter'
																	)
																		setEditingIndex(
																			null
																		);
																}}
																className="w-full bg-white border border-gray-200 rounded-sm px-2 py-1 text-sm text-slate-700 outline-none focus:border-blue-600"
															/>
														) : (
															<span className={`block text-sm px-2 py-1 ${item.deleted ? 'text-gray-400 line-through' : 'text-slate-700'}`}>
																{item.value || (
																	<span className="text-gray-300">
																		Valor
																		vacío
																	</span>
																)}
															</span>
														)}
													</div>
													{item.deleted ? (
														<button
															type="button"
															onClick={() =>
																handleRestore(
																	index
																)
															}
															className="p-1.5 text-green-600 hover:bg-green-50 rounded-full transition-colors cursor-pointer"
															title="Restaurar"
														>
															<ArrowUturnLeftIcon className="size-4" />
														</button>
													) : (
														<>
															<Can
																action="update"
																subject={subject}
															>
																<button
																	type="button"
																	onClick={() =>
																		handleStartEdit(
																			index
																		)
																	}
																	className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
																	title="Editar"
																>
																	<PencilSquareIcon className="size-4" />
																</button>
															</Can>
															<Can
																action="delete"
																subject={subject}
															>
																<button
																	type="button"
																	onClick={() =>
																		handleDelete(
																			index
																		)
																	}
																	className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
																	title="Eliminar"
																>
																	<TrashIcon className="size-4" />
																</button>
															</Can>
														</>
													)}
												</div>
												);
											})}
										</div>
									)}

									<Can action="create" subject={subject}>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={handleAdd}
											className="mt-3 w-full rounded-sm border-dashed border-green-400 text-green-600 hover:text-white hover:bg-green-600 hover:border-green-600"
										>
											<FiPlus className="size-4" />
											Agregar nuevo
										</Button>
									</Can>
								</>
							) : (
								<div className="flex items-center justify-center py-12">
									<p className="text-sm text-gray-400">
										No tienes permiso para ver esta
										información
									</p>
								</div>
							)
						}
					</Can>
				</div>

				{canWrite && (
					<div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
            <Button
              className='w-full sm:w-auto'
							type="button"
							variant="outline"
							onClick={handleCancel}
							disabled={isSaving}
						>
							Cancelar
						</Button>
            <Button
              className='w-full sm:w-auto'
							type="button"
							onClick={handleSave}
							disabled={!hasChanges || isSaving || hasEmptyValue}
						>
							{isSaving ? (
								<>
									<div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
									Guardando...
								</>
							) : (
								<>
									<FiSave className="size-4" />
									Guardar Cambios
								</>
							)}
						</Button>
					</div>
				)}
			</div>
		</ModalBase>
	);
};
