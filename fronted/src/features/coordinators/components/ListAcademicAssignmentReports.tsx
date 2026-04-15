import { Button } from '@components/ui/button';
import { Pagination } from '@components';
import { useGetAcademicAssignmentReportsCoordinatorByCenter } from '../hooks';
import { Loading, TagError } from '@components';
import { ResponsiveTable, IResponsiveColumn } from '@components/ui/ResponsiveTable';
import { EyeIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ReportData {
	id: string;
	period: {
		year: number;
		pac_modality: string;
		pac: number;
	};
	teacher: {
		user: {
			name: string;
			code: string;
		};
	};
}

interface IProps {
	centerDepartmentId: string;
}

export const ListAcademicAssignmentReports = ({
	centerDepartmentId,
}: IProps) => {
	const navigate = useNavigate();
	const { isLoading, isError, data } =
		useGetAcademicAssignmentReportsCoordinatorByCenter(centerDepartmentId);

	if (isLoading) return <Loading />;
	if (isError) return <TagError text="Error al cargar los reportes" />;

	const reports = (data?.data ?? []) as ReportData[];

	const handleView = (
		reportId: string,
		teacherName: string,
		teacherCode: string
	) => {
		navigate(`/coordinadores/informe-asignación-académica/${reportId}`, {
			state: {
				teacherName,
				teacherCode,
			},
		});
	};

	const columns: IResponsiveColumn<ReportData>[] = [
		{
			key: 'period',
			header: 'Periodo',
			mobileLabel: 'Periodo',
			render: (row: ReportData) => (
				<span>
					<span className="font-medium text-[#144C74]">
						{row.period.year}
					</span>
					{' - '}
					<span className="text-gray-600">
						{row.period.pac_modality} {row.period.pac}
					</span>
				</span>
			),
		},
		{
			key: 'teacher.user.name',
			header: 'Docente',
			mobileLabel: 'Docente',
		},
		{
			key: 'actions',
			header: 'Acciones',
			mobileLabel: 'Acciones',
			render: (row: ReportData) => (
				<Button
					type="button"
					className="text-[#144C74] hover:text-[#FCC40C] transition font-medium underline"
					onClick={() => {
						handleView(
							row.id,
							row.teacher.user.name,
							row.teacher.user.code
						);
					}}
					variant="unstyled"
				>
					<EyeIcon className="mt-1" />
				</Button>
			),
		},
	];

	return (
		<>
			<div className="py-2 mt-4">
				<ResponsiveTable<ReportData>
					columns={columns}
					data={reports}
					getRowKey={r => r.id}
					loading={isLoading}
					emptyMessage="No hay reportes disponibles"
				/>
			</div>
			<div className="mt-4">
				<Pagination totalPages={data?.meta?.lastPage} />
			</div>
		</>
	);
};
