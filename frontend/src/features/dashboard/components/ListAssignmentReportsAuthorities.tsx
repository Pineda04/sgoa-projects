import { useGetAllAssignmentReportsForAuthorities } from '@api/assignment-reports';
import { TAssignmentReport } from '@api/assignment-reports';
import { Button, IResponsiveColumn, Loading, Pagination, ResponsiveTable, TagError } from '@shared/components';
import { EyeIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ListAssignmentReportsAuthorities = () => {
	const navigate = useNavigate();
	const { isLoading, isError, data } = useGetAllAssignmentReportsForAuthorities();

	if (isLoading) return <Loading />;
	if (isError) return <TagError text="No se encontraron datos disponibles." />;

	const reports = (data?.data ?? []) as TAssignmentReport[];

	const handleView = (reportId: string, teacherName: string, teacherCode: string) => {
		navigate(`/academic/reports/coordinator/${reportId}`, {
			state: { teacherName, teacherCode },
		});
	};

	const columns: IResponsiveColumn<TAssignmentReport>[] = [
		{
			key: 'period',
			header: 'Periodo',
			mobileLabel: 'Periodo',
			render: (row: TAssignmentReport) => (
				<span>
					<span className="font-medium text-[#144C74]">{row.period.year}</span>
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
			key: 'teacher.user.code',
			header: 'Código',
			mobileLabel: 'Código',
			render: (row: TAssignmentReport) => (
				<span className="font-mono text-sm">{row.teacher.user.code}</span>
			),
		},
		{
			key: 'centerDepartment.department.name',
			header: 'Departamento',
			mobileLabel: 'Departamento',
			render: (row: TAssignmentReport) => (
				<span className="text-sm">{row.centerDepartment?.department?.name ?? '—'}</span>
			),
		},
		{
			key: 'centerDepartment.center.name',
			header: 'Centro',
			mobileLabel: 'Centro',
			render: (row: TAssignmentReport) => (
				<span className="text-sm text-gray-600">{row.centerDepartment?.center?.name ?? '—'}</span>
			),
		},
		{
			key: 'actions',
			header: 'Acciones',
			mobileLabel: 'Acciones',
			render: (row: TAssignmentReport) => (
				<Button
					type="button"
					className="text-[#144C74] hover:text-[#FCC40C] transition font-medium underline"
					onClick={() =>
						handleView(row.id, row.teacher.user.name, row.teacher.user.code)
					}
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
				<ResponsiveTable<TAssignmentReport>
					columns={columns}
					data={reports}
					getRowKey={r => r.id}
					loading={isLoading}
					emptyMessage="No hay informes disponibles"
				/>
			</div>
			<div className="mt-4">
				<Pagination totalPages={data?.meta?.lastPage} />
			</div>
		</>
	);
};
