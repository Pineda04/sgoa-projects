import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { usePaginationParams } from '@shared/hooks';
import { Button } from './button';

interface Props {
	totalPages?: number;
}

export const Pagination = ({ totalPages = 0 }: Props) => {
	const { page, setPage } = usePaginationParams();

	const handlePageChange = (newPage: number) => {
		if (newPage < 1 || newPage > totalPages) return;
		setPage(newPage);
	};

	if (!totalPages || totalPages <= 1) return null;

	const getPageNumbers = () => {
		const pages: (number | 'ellipsis')[] = [];
		const maxVisible = 6;

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
		<div className="flex items-center justify-center gap-1 mt-4">
			<Button
				variant="ghost"
				size="sm"
				disabled={page === 1}
				onClick={() => handlePageChange(page - 1)}
				className="gap-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:hover:bg-transparent"
			>
				<ChevronLeft className="h-4 w-4" />
				<span className="hidden sm:inline">Previa</span>
			</Button>

			<div className="flex items-center gap-1">
				{pageNumbers.map((pn, idx) =>
					pn === 'ellipsis' ? (
						<span
							key={`ellipsis-${idx}`}
							className="flex items-center justify-center w-9 h-9 text-slate-400"
						>
							<MoreHorizontal className="h-4 w-4" />
						</span>
					) : (
						<Button
							key={pn}
							variant={page === pn ? 'default' : 'ghost'}
							size="sm"
							onClick={() => handlePageChange(pn)}
							className={`min-w-9 h-9 px-0 ${
								page === pn
									? 'bg-[#144c74] hover:bg-[#0d436d] text-white font-medium shadow-sm'
									: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
							}`}
						>
							{pn}
						</Button>
					)
				)}
			</div>

			<Button
				variant="ghost"
				size="sm"
				disabled={page === totalPages}
				onClick={() => handlePageChange(page + 1)}
				className="gap-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:hover:bg-transparent"
			>
				<span className="hidden sm:inline">Siguiente</span>
				<ChevronRight className="h-4 w-4" />
			</Button>
		</div>
	);
};
