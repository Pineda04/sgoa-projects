import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { usePaginationParams } from '@shared/hooks';
import { Button } from './button';

interface Props {
	totalPages?: number;
}

interface PaginationControlsProps {
	page: number;
	totalPages?: number;
	onPageChange: (page: number) => void;
}

export const PaginationControls = ({
	page,
	totalPages = 0,
	onPageChange,
}: PaginationControlsProps) => {
	const handlePageChange = (newPage: number) => {
		if (newPage < 1 || newPage > totalPages) return;
		onPageChange(newPage);
	};

	if (!totalPages || totalPages <= 1) return null;

	const getPageNumbers = () => {
		const pages: (number | 'ellipsis')[] = [];
		const maxVisible = 5;

		if (totalPages <= maxVisible) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
			return pages;
		}

		pages.push(1);

		if (page > 3) {
			pages.push('ellipsis');
		}

		const start = Math.max(2, page - 1);
		const end = Math.min(totalPages - 1, page + 1);

		for (let i = start; i <= end; i++) {
			if (!pages.includes(i)) {
				pages.push(i);
			}
		}

		if (page < totalPages - 2) {
			pages.push('ellipsis');
		}

		if (!pages.includes(totalPages)) {
			pages.push(totalPages);
		}

		return pages;
	};

	const pageNumbers = getPageNumbers();

	return (
		<div className="mt-4 flex items-center justify-center gap-1">
			<Button
				aria-label="Ir a la página anterior"
				variant="ghost"
				size="sm"
				disabled={page === 1}
				onClick={() => handlePageChange(page - 1)}
				className="gap-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:hover:bg-transparent"
			>
				<ChevronLeft className="h-4 w-4" />
				<span className="hidden sm:inline">Previa</span>
			</Button>

			<div className="flex items-center gap-1">
				{pageNumbers.map((pn, idx) =>
					pn === 'ellipsis' ? (
						<span
							key={`ellipsis-${idx}`}
							aria-hidden="true"
							className="hidden size-9 items-center justify-center text-muted-foreground sm:flex"
						>
							<MoreHorizontal className="h-4 w-4" />
						</span>
					) : (
						<Button
							key={pn}
							aria-label={`Ir a la página ${pn}`}
							aria-current={page === pn ? 'page' : undefined}
							variant={page === pn ? 'default' : 'ghost'}
							size="sm"
							onClick={() => handlePageChange(pn)}
							className={`h-9 min-w-9 px-0 ${
								page === pn
									? 'bg-primary font-medium text-primary-foreground shadow-sm hover:bg-primary-hover'
									: 'text-muted-foreground hover:bg-muted hover:text-foreground'
							}`}
						>
							{pn}
						</Button>
					)
				)}
			</div>

			<Button
				aria-label="Ir a la página siguiente"
				variant="ghost"
				size="sm"
				disabled={page === totalPages}
				onClick={() => handlePageChange(page + 1)}
				className="gap-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:hover:bg-transparent"
			>
				<span className="hidden sm:inline">Siguiente</span>
				<ChevronRight className="h-4 w-4" />
			</Button>
		</div>
	);
};

export const Pagination = ({ totalPages = 0 }: Props) => {
	const { page, setPage } = usePaginationParams();

	return (
		<PaginationControls
			page={page}
			totalPages={totalPages}
			onPageChange={setPage}
		/>
	);
};
