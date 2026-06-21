import { useGetAcademicAssignmentCoordinatorOnlyPeriods } from '@api/assignment-reports';
import { EyeIcon } from '@heroicons/react/24/outline';
import { IResponsiveColumn, Loading, ResponsiveTable } from '@shared/components';
import { Link, useSearchParams } from 'react-router-dom';

interface PeriodData {
	id: string;
	pac: number;
	pac_modality: string;
	year: number;
}

// FIX: Segmentar segun el rol
// WARNING: SIN USO!!
export const ListPlanifications = () => {
	const [params] = useSearchParams();
	const centerDepartmentIdParam = params.get('centerDepartmentId');

	const academicAssignmentsReportsPeriodsInfo =
		useGetAcademicAssignmentCoordinatorOnlyPeriods(
			centerDepartmentIdParam ?? undefined
		);

	if (academicAssignmentsReportsPeriodsInfo.isLoading) return <Loading />;
	if (academicAssignmentsReportsPeriodsInfo.isError)
		return (
			<div className="bg-yellow-500 text-black p-6 rounded-lg shadow-lg max-w-2xl mx-auto mt-4">
				<p className="text-1xl font-semibold">
					No se encontraron datos disponibles.
				</p>
			</div>
		);

	const periods = (academicAssignmentsReportsPeriodsInfo.data ?? []) as PeriodData[];

	const columns: IResponsiveColumn<PeriodData>[] = [
		{
			key: 'pac',
			header: 'Planificación',
			mobileLabel: 'Planificación',
			render: (row: PeriodData) => `PAC No. ${row.pac}, ${row.pac_modality}, ${row.year}`,
		},
		{
			key: 'id',
			header: 'Ver contenido',
			mobileLabel: 'Ver',
			render: (row: PeriodData) => (
				<Link
					className="flex justify-center items-center p-1 w-full"
					to="/academic/planifications"
					state={{
						year: row.year,
						pac: row.pac,
						periodId: row.id,
					}}
				>
					<EyeIcon className="size-5 text-[#1C64B4] hover:text-[#144C74]" />
				</Link>
			),
		},
	];

	return (
		<div className="py-2">
			<ResponsiveTable<PeriodData>
				columns={columns}
				data={periods}
				getRowKey={p => p.id}
				loading={academicAssignmentsReportsPeriodsInfo.isLoading}
				emptyMessage="No hay planificaciones disponibles"
			/>
		</div>
	);
};
