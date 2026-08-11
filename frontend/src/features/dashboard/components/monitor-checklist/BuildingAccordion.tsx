import { ChevronDown } from 'lucide-react';
import { AssignmentList } from './AssignmentList';
import { ProgressBar } from './ChecklistProgress';
import {
	summarizeItems,
	TChecklistBuildingGroup,
	TChecklistItem,
	TChecklistView,
} from './checklist.utils';

const BODY_CLASSES: Record<TChecklistView, string> = {
	COMPACT: '',
	DETAILED: 'p-3 sm:p-4',
	GRID: 'p-3 sm:p-4',
};

interface BuildingAccordionProps {
	group: TChecklistBuildingGroup;
	view: TChecklistView;
	isOpen: boolean;
	onToggle: () => void;
	submittingId: string | null;
	isRegistering: boolean;
	onConfirm: (item: TChecklistItem, isPresent: boolean) => void;
	onOpenModal: (item: TChecklistItem) => void;
	onEditCheck: (item: TChecklistItem) => void;
}

export const BuildingAccordion = ({
	group,
	view,
	isOpen,
	onToggle,
	submittingId,
	isRegistering,
	onConfirm,
	onOpenModal,
	onEditCheck,
}: BuildingAccordionProps) => {
	const { total, verified } = summarizeItems(group.items);
	const panelId = `building-panel-${group.buildingId}`;

	return (
		<section className="overflow-hidden rounded-xl border border-card-border bg-card">
			<button
				type="button"
				onClick={onToggle}
				aria-expanded={isOpen}
				aria-controls={panelId}
				className="flex w-full cursor-pointer items-center gap-3 bg-muted/40 px-3 py-3 text-left transition-colors hover:bg-muted/70 sm:px-4"
			>
				<div className="min-w-0 flex-1">
					<p
						className="truncate font-semibold text-foreground"
						title={group.buildingName}
					>
						{group.buildingName}
					</p>
					<p className="text-xs text-muted-foreground tabular-nums">
						{verified} de {total} verificadas
					</p>
					<ProgressBar
						value={verified}
						total={total}
						className="mt-1.5 h-1 max-w-40"
					/>
				</div>

				<ChevronDown
					className={`size-5 shrink-0 text-muted-foreground transition-transform ${
						isOpen ? 'rotate-180' : ''
					}`}
				/>
			</button>

			<div
				hidden={!isOpen}
				id={panelId}
				className={`border-t border-border ${BODY_CLASSES[view]}`}
			>
				<AssignmentList
					items={group.items}
					view={view}
					submittingId={submittingId}
					isRegistering={isRegistering}
					onConfirm={onConfirm}
					onOpenModal={onOpenModal}
					onEditCheck={onEditCheck}
				/>
			</div>
		</section>
	);
};
