import { useState } from 'react';
import { FileSpreadsheet, FileText, Loader2, Pencil } from 'lucide-react';
import {
	monitorApi,
	TCheckFilters,
	TMonitorReportSummary,
	TScheduleComplianceCheckDetail,
} from '@api/monitor';
import { useAuth } from '@config/providers';
import {
	Button,
	DataTable,
	Pagination,
	TagError,
	type IDataTableColumn,
} from '@shared/components';
import { useModal } from '@shared/hooks';
import { ESwalIcons, formatHondurasDateTime, genericAlert } from '@shared/utils';
import { useAbility } from '@config';
import { EditCheckModal } from './EditCheckModal';
import {
	buildExportRows,
	EXPORT_ALL_CHECKS_SIZE,
} from './monitor-report-export.utils';
import { exportMonitorReportExcel } from './monitor-report-excel.utils';
import { exportMonitorReportPdf } from './monitor-report-pdf.utils';
import {
	formatCheckDate,
	isCheckEdited,
	STATUS_BADGE_CONFIG,
} from './monitor-reports.utils';

type TExportFormat = 'pdf' | 'excel';

const EMPTY_SUMMARY: TMonitorReportSummary = {
	totalChecks: 0,
	present: 0,
	absent: 0,
	complianceRate: 0,
};

const buildColumns = (
	canEditRow: (row: TScheduleComplianceCheckDetail) => boolean,
	onEdit: (row: TScheduleComplianceCheckDetail) => void
): IDataTableColumn<TScheduleComplianceCheckDetail>[] => [
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
		render: row => (
			<>
				<span>{row.observation || '-'}</span>
				{isCheckEdited(row) && (
					<p className="text-xs font-medium text-amber-600 dark:text-amber-400">
						Editado: {formatHondurasDateTime(row.updatedAt)}
					</p>
				)}
			</>
		),
	},
	{
		key: 'actions',
		header: 'Acciones',
		render: row =>
			canEditRow(row) ? (
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => onEdit(row)}
				>
					<Pencil className="size-4" />
					<span className="hidden sm:inline">Editar</span>
				</Button>
			) : (
				<span className="text-muted-foreground">-</span>
			),
	},
];

interface MonitorReportTableProps {
	data: TScheduleComplianceCheckDetail[];
	isLoading: boolean;
	isError: boolean;
	totalPages: number;
	filters: TCheckFilters;
	summary?: TMonitorReportSummary;
}

export const MonitorReportTable = ({
	data,
	isLoading,
	isError,
	totalPages,
	filters,
	summary,
}: MonitorReportTableProps) => {
	const { authState } = useAuth();
	const ability = useAbility();
	const [exportingFormat, setExportingFormat] = useState<TExportFormat | null>(
		null
	);
	const [editingCheck, setEditingCheck] =
		useState<TScheduleComplianceCheckDetail | null>(null);
	const [isEditModalOpen, openEditModal, closeEditModal] = useModal();

	// Editar es una capacidad, no un nombre de rol: cualquier rol con el permiso
	// puede corregir sus propias verificaciones.
	const canEditChecks = ability.can('update', 'schedule-compliance-check');
	const currentUserId = authState.user?.sub;

	const canEditRow = (row: TScheduleComplianceCheckDetail) =>
		canEditChecks && row.monitor.id === currentUserId;

	const handleOpenEdit = (row: TScheduleComplianceCheckDetail) => {
		setEditingCheck(row);
		openEditModal();
	};

	const handleExport = async (format: TExportFormat) => {
		setExportingFormat(format);
		try {
			const response = await monitorApi.getChecks(
				1,
				EXPORT_ALL_CHECKS_SIZE,
				filters
			);
			const rows = buildExportRows(response.data.data);

			if (rows.length === 0) {
				genericAlert(
					'No hay incidencias para exportar en este periodo.',
					ESwalIcons.ERROR
				);
				return;
			}

			const exportParams = {
				rows,
				summary: summary ?? EMPTY_SUMMARY,
				dateFrom: filters.dateFrom,
				dateTo: filters.dateTo,
			};

			if (format === 'pdf') {
				await exportMonitorReportPdf(exportParams);
			} else {
				await exportMonitorReportExcel(exportParams);
			}

			const total = response.data.meta?.total ?? rows.length;
			if (total > rows.length) {
				genericAlert(
					`Se exportaron ${rows.length} de ${total} incidencias. Reduce el rango de fechas para exportar el resto.`,
					ESwalIcons.ERROR,
					4000
				);
			}
		} catch {
			genericAlert(
				'Ocurrió un error al generar el archivo. Intenta nuevamente.',
				ESwalIcons.ERROR
			);
		} finally {
			setExportingFormat(null);
		}
	};

	return (
		<div className="space-y-3">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<p className="text-sm font-semibold text-foreground">
					Incidencias registradas
				</p>
				<div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto">
					<Button
						type="button"
						variant="outline"
						size="sm"
						disabled={exportingFormat !== null}
						onClick={() => handleExport('pdf')}
					>
						{exportingFormat === 'pdf' ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							<FileText className="size-4" />
						)}
						<span className="hidden sm:inline">Exportar a </span>PDF
					</Button>
					<Button
						type="button"
						variant="outline"
						size="sm"
						disabled={exportingFormat !== null}
						onClick={() => handleExport('excel')}
					>
						{exportingFormat === 'excel' ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							<FileSpreadsheet className="size-4" />
						)}
						<span className="hidden sm:inline">Exportar a </span>Excel
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
						columns={buildColumns(canEditRow, handleOpenEdit)}
						data={data}
						loading={isLoading}
						getRowKey={row => row.id}
						emptyMessage="No hay verificaciones registradas en este periodo."
					/>
					<Pagination totalPages={totalPages} />
				</>
			)}

			<EditCheckModal
				isOpen={isEditModalOpen}
				onClose={closeEditModal}
				check={editingCheck}
			/>
		</div>
	);
};
