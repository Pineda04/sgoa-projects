import { useCallback } from 'react';
import { IoAddSharp } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, FileText, BookOpen, Users } from 'lucide-react';
import { InfoTeacher } from '../../reports/components';
import { useTabWithReset } from '@shared/hooks';
import { useGetCurrentAcademicPeriod } from '@api/periods';
import { useGetCurrentUserCourses } from '@api/courses';
import { useGetAcademicAssignmentReportsPeriods } from '@api/assignment-reports';
import { Button, IResponsiveColumn, ResponsiveTable, Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/components';

interface CourseData {
	id: string;
	course: {
		code: string;
		name: string;
		uvs: number;
		department: {
			name: string;
		};
	};
	section: string;
	days: string;
	studentCount: number;
	classroom: {
		name: string;
		center: {
			name: string;
		};
	};
	coordinator: {
		name: string;
	};
	observation?: string | null;
}

interface ReportPeriod {
	id: string;
	pac: number;
	pac_modality: string;
	year: number;
	department: string;
	center: string;
	reportId: string;
}

export const DashboardTeacher = () => {
	const navigate = useNavigate();
	const validTabs = ['0', '1'];
	const { currentTab, setTab } = useTabWithReset(validTabs);
	const academicPeriodInfo = useGetCurrentAcademicPeriod();
	const coursesInfo = useGetCurrentUserCourses();
	const academicAssignmentReportsPeriodsInfo =
		useGetAcademicAssignmentReportsPeriods();

	const handleView = useCallback(
		(reportId: string, mode: 'edit' | 'view') => {
			sessionStorage.setItem('academicReport_mode', mode);
			navigate(`/academic/reports/teacher/${reportId}`, {
				state: { mode },
			});
		},
		[navigate]
	);

	const courseColumns: IResponsiveColumn<CourseData>[] = [
		{ key: 'course.code', header: 'Cod.', mobileLabel: 'Cod.' },
		{
			key: 'course.name',
			header: 'Asignatura',
			mobileLabel: 'Asig.',
			render: (row: CourseData) => (
				<span className="font-medium max-w-50 truncate block">
					{row.course.name}
				</span>
			),
		},
		{
			key: 'section',
			header: 'Sec.',
			mobileLabel: 'Sec.',
			render: (row: CourseData) => (
				<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
					{row.section}
				</span>
			),
		},
		{ key: 'course.uvs', header: 'UV', mobileLabel: 'UV' },
		{
			key: 'days',
			header: 'Días',
			mobileLabel: 'Días',
			hiddenOnMobile: true,
		},
		{
			key: 'studentCount',
			header: 'Alumnos',
			mobileLabel: 'Alum.',
			render: (row: CourseData) => (
				<span className="inline-flex items-center gap-1">
					<Users className="w-3 h-3 text-muted-foreground" />
					{row.studentCount}
				</span>
			),
		},
		{
			key: 'classroom.name',
			header: 'Aula',
			mobileLabel: 'Aula',
			hiddenOnMobile: true,
		},
		{
			key: 'course.department.name',
			header: 'Carrera',
			mobileLabel: 'Carrera',
			hiddenOnMobile: true,
		},
		{
			key: 'coordinator.name',
			header: 'Coordinador',
			mobileLabel: 'Coord.',
			hiddenOnMobile: true,
		},
		{
			key: 'classroom.center.name',
			header: 'Centro',
			mobileLabel: 'Centro',
			hiddenOnMobile: true,
		},
		{
			key: 'observation',
			header: 'Obs.',
			mobileLabel: 'Obs.',
			hiddenOnMobile: true,
		},
	];

	const reportColumns: IResponsiveColumn<ReportPeriod>[] = [
		{
			key: 'pac',
			header: 'Periodo',
			mobileLabel: 'Periodo',
			render: (row: ReportPeriod) => (
				<div>
					<span className="inline-flex items-center px-2 py-1 rounded-md bg-accent/20 text-foreground text-xs font-medium">
						PAC {row.pac}
					</span>
					<p className="text-xs text-muted-foreground mt-1">
						{row.pac_modality}, {row.year}
					</p>
				</div>
			),
		},
		{
			key: 'department',
			header: 'Carrera',
			mobileLabel: 'Carrera',
			hiddenOnMobile: true,
		},
		{
			key: 'center',
			header: 'Centro',
			mobileLabel: 'Centro',
			hiddenOnMobile: true,
		},
		{
			key: 'reportId',
			header: 'Ver',
			mobileLabel: 'Ver',
			render: (row: ReportPeriod) => (
				<Button
					onClick={() => handleView(row.reportId, 'view')}
					variant="ghost"
					size="icon-sm"
					className="hover:bg-primary/10 hover:text-primary"
				>
					<EyeIcon className="w-4 h-4" />
				</Button>
			),
		},
	];

	return (
		<div className="pb-8 sm:pb-12">
			<InfoTeacher />

			<Tabs
				value={currentTab}
				onValueChange={setTab}
				className="mt-4 sm:mt-8"
			>
				<TabsList variant="pills" className="mb-4 sm:mb-6">
					<TabsTrigger
						value="0"
						className="gap-1.5 sm:gap-2 text-xs sm:text-sm"
					>
						<BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
						<span className="hidden xs:inline">
							Clases asignadas
						</span>
						<span className="xs:hidden">Clases</span>
					</TabsTrigger>
					<TabsTrigger
						value="1"
						className="gap-1.5 sm:gap-2 text-xs sm:text-sm"
					>
						<FileText className="w-3 h-3 sm:w-4 sm:h-4" />
						<span className="hidden xs:inline">Informes</span>
						<span className="xs:hidden">Informes</span>
					</TabsTrigger>
				</TabsList>

				<TabsContent value="0">
					<div className="bg-card border border-card-border rounded-xl shadow-lg shadow-primary/5 overflow-hidden">
						<ResponsiveTable<CourseData>
							columns={courseColumns}
							data={coursesInfo.data || []}
							getRowKey={c => c.id}
							loading={coursesInfo.isLoading}
							emptyMessage="No hay clases asignadas"
						/>
					</div>
				</TabsContent>

				<TabsContent value="1">
					<div className="bg-card border border-card-border rounded-xl shadow-lg shadow-primary/5 p-3 sm:p-6">
						<Button
							onClick={() =>
								handleView(
									academicAssignmentReportsPeriodsInfo.data?.find(
										aar =>
											aar.id ===
											academicPeriodInfo.data?.id
									)?.reportId ?? '',
									'edit'
								)
							}
							disabled={
								!academicPeriodInfo.data?.id ||
								!academicAssignmentReportsPeriodsInfo.data?.find(
									aar =>
										aar.id === academicPeriodInfo.data?.id
								)
							}
							className="w-full md:w-auto text-xs sm:text-sm bg-[#C40C54] hover:bg-[#AC0647] hover:shadow-xl hover:shadow-[#C40C54]/20 hover:-translate-y-0.5"
							variant="default"
						>
							<IoAddSharp className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
							<span className="hidden sm:inline">
								Ver informe de asignación académica del periodo
								actual
							</span>
							<span className="sm:hidden">
								Ver informe actual
							</span>
						</Button>

						<div className="mt-4 sm:mt-6">
							<ResponsiveTable<ReportPeriod>
								columns={reportColumns}
								data={academicAssignmentReportsPeriodsInfo.data || []}
								getRowKey={r => r.id}
								loading={academicAssignmentReportsPeriodsInfo.isLoading}
								emptyMessage="No hay informes disponibles"
								showRowNumber={false}
							/>
						</div>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
};
