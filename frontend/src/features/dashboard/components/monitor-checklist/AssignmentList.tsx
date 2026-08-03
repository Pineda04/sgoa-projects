import { AssignmentCard } from './AssignmentCard';
import { AssignmentCompactRow } from './AssignmentCompactRow';
import { AssignmentDetailedRow } from './AssignmentDetailedRow';
import { TChecklistItem, TChecklistView } from './checklist.utils';

const VIEW_RENDERERS = {
	COMPACT: AssignmentCompactRow,
	DETAILED: AssignmentDetailedRow,
	GRID: AssignmentCard,
} as const;

const VIEW_CONTAINER_CLASSES: Record<TChecklistView, string> = {
	COMPACT: 'divide-y divide-border',
	DETAILED: 'space-y-3',
	GRID: 'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3',
};

interface AssignmentListProps {
	items: TChecklistItem[];
	view: TChecklistView;
	submittingId: string | null;
	isRegistering: boolean;
	onConfirm: (item: TChecklistItem, isPresent: boolean) => void;
	onOpenModal: (item: TChecklistItem) => void;
	onEditCheck: (item: TChecklistItem) => void;
}

export const AssignmentList = ({
	items,
	view,
	submittingId,
	isRegistering,
	onConfirm,
	onOpenModal,
	onEditCheck,
}: AssignmentListProps) => {
	const Renderer = VIEW_RENDERERS[view];

	return (
		<ul className={VIEW_CONTAINER_CLASSES[view]}>
			{items.map(item => (
				<Renderer
					key={item.id}
					item={item}
					isSubmitting={submittingId === item.id}
					disabled={isRegistering && submittingId !== item.id}
					onConfirm={isPresent => onConfirm(item, isPresent)}
					onOpenModal={() => onOpenModal(item)}
					onEditCheck={() => onEditCheck(item)}
				/>
			))}
		</ul>
	);
};
