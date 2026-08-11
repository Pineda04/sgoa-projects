import { FileSpreadsheet, Loader2 } from 'lucide-react';
import { Button } from '@shared/components';

interface AnalyticsExportButtonProps {
	onClick: () => void;
	isExporting: boolean;
}

export const AnalyticsExportButton = ({
	onClick,
	isExporting,
}: AnalyticsExportButtonProps) => (
	<Button
		type="button"
		variant="outline"
		size="sm"
		onClick={onClick}
		disabled={isExporting}
		title="Exportar datos en Excel"
		className="h-10 self-start px-3 sm:self-auto"
	>
		{isExporting ? (
			<Loader2 className="size-4 animate-spin" aria-hidden="true" />
		) : (
			<FileSpreadsheet className="size-4" aria-hidden="true" />
		)}
		{isExporting ? 'Exportando…' : 'Exportar'}
	</Button>
);
