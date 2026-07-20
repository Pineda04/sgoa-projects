import { FileSpreadsheet, FileText } from 'lucide-react';
import { TScheduleComplianceCheckDetail } from '@api/monitor';
import {
	Button,
	DataTable,
	Pagination,
	TagError,
	type IDataTableColumn,
} from '@shared/components';
import { ESwalIcons, genericAlert } from '@shared/utils';
import { formatCheckDate, STATUS_BADGE_CONFIG } from './monitor-reports.utils';

const handleExport = () => {
	genericAlert('Funcionalidad próxima disponible.', ESwalIcons.SUCCESS, 2000);
};

const columns: IDataTableColumn<TScheduleComplianceCheckDetail>[] = [
	{
		key: 'checkDate',
		header: 'Fecha',
		render: row => formatCheckDate(row.checkDate),
	},
	{ key: 'checkTime', header: 'Hora' },
	{ key: 'courseClassroom.classroom.name', header: 'Aula' },
	{
		key: 'courseClassroom.classroom.building.name',
		header: 'Edificio',
		hiddenOnMobile: true,
	},
	{ key: 'courseClassroom.teacher.name', header: 'Docente' },
	{
		key: 'isPresent',
		header: 'Estado',
		render: row => {
			const status = row.isPresent
				? STATUS_BADGE_CONFIG.PRESENT
				: STATUS_BADGE_CONFIG.ABSENT;
			return (
				<span
					className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.badgeClassName}`}
				>
					{status.label}
				</span>
			);
		},
	},
	{
		key: 'observation',
		header: 'Observaciones',
		hiddenOnMobile: true,
		render: row => row.observation || '-',
	},
];

interface MonitorReportTableProps {
	data: TScheduleComplianceCheckDetail[];
	isLoading: boolean;
	isError: boolean;
	totalPages: number;
}

export const MonitorReportTable = ({
	data,
	isLoading,
	isError,
	totalPages,
}: MonitorReportTableProps) => {
	return (
		<div className="space-y-3">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<p className="text-sm font-semibold text-foreground">
					Incidencias registradas
				</p>
				<div className="flex gap-2">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={handleExport}
					>
						<FileText className="size-4" />
						Exportar a PDF
					</Button>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={handleExport}
					>
						<FileSpreadsheet className="size-4" />
						Exportar a Excel
					</Button>
				</div>
			</div>

			{isError ? (
				<TagError text="Ocurrió un error al cargar las verificaciones. Intenta nuevamente." />
			) : !isLoading && data.length === 0 ? (
				<TagError text="No hay verificaciones registradas en este periodo." />
			) : (
				<>
					<DataTable
						columns={columns}
						data={data}
						loading={isLoading}
						getRowKey={row => row.id}
						emptyMessage="No hay verificaciones registradas en este periodo."
					/>
					<Pagination totalPages={totalPages} />
				</>
			)}
		</div>
	);
};
