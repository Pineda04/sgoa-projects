import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, Users } from 'lucide-react';
import { useTabWithReset } from '@shared/hooks';
import { useGetCurrentAcademicPeriod } from '@api/periods';
import { useGetCurrentUserCourses } from '@api/courses';
import { TCourseClassroom } from '@api/courses';
import { useGetAcademicAssignmentReportsPeriods } from '@api/assignment-reports';
import {
	Button,
	IResponsiveColumn,
	ResponsiveTable,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '@shared/components';
import { useUser } from '@config/providers';
import { InfoTeacher } from '../components';
import { DocumentPlusIcon } from '@heroicons/react/24/outline';

interface ReportPeriod {
	id: string;
	pac: number;
	pac_modality: string;
	year: number;
	department: string;
	center: string;
	centerDepartmentId: string;
	reportId: string;
}

export const DashboardTeacher = () => {
	const navigate = useNavigate();
	const validTabs = ['0', '1'];
	const { currentTab, setTab } = useTabWithReset(validTabs);
	const currentUser = useUser();
	const academicPeriodInfo = useGetCurrentAcademicPeriod();
	const coursesInfo = useGetCurrentUserCourses();
	const academicAssignmentReportsPeriodsInfo =
		useGetAcademicAssignmentReportsPeriods();

	const [selectedPosition, setSelectedPosition] = useState('');

	useEffect(() => {
		if (
			currentUser.user &&
			currentUser.user.positions.length > 0 &&
			!selectedPosition
		) {
			setSelectedPosition(
				currentUser.user.positions[0].centerDepartmentId
			);
		}
	}, [currentUser.user, selectedPosition]);

	const currentPosition = currentUser.user?.positions.find(
		p => p.centerDepartmentId === selectedPosition
	);

	const filteredCourses =
		coursesInfo.data?.filter(
			c => c.classroom.center.id === currentPosition?.center.id
		) ?? [];

	const filteredReports =
		academicAssignmentReportsPeriodsInfo.data?.filter(
			r => r.centerDepartmentId === selectedPosition
		) ?? [];

	const currentPeriodReport = filteredReports.find(
		r => r.id === academicPeriodInfo.data?.id
	);

	const handleView = useCallback(
		(reportId: string, mode: 'edit' | 'view') => {
			sessionStorage.setItem('academicReport_mode', mode);
			navigate(`/academic/reports/teacher/${reportId}`, {
				state: { mode },
			});
		},
		[navigate]
	);

	const courseColumns: IResponsiveColumn<TCourseClassroom>[] = [
		{ key: 'course.code', header: 'Código', mobileLabel: 'Código' },
		{
			key: 'course.name',
			header: 'Asignatura',
			mobileLabel: 'Asig.',
			render: (row: TCourseClassroom) => (
				<span className="flex justify-center py-2">
					{row.course.name}
				</span>
			),
		},
		{
			key: 'section',
			header: 'Sección',
			mobileLabel: 'Sección',
			render: (row: TCourseClassroom) => (
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
			render: (row: TCourseClassroom) => (
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
	];

	const reportColumns: IResponsiveColumn<ReportPeriod>[] = [
		{
			key: 'pac',
			header: 'Periodo',
			mobileLabel: 'Periodo',
			render: (row: ReportPeriod) => (
				<div className="flex justify-center items-center gap-2 flex-wrap">
					<span className="inline-flex items-center px-2 py-1 rounded-md bg-accent/20 text-foreground text-xs font-medium">
						PAC {row.pac}
					</span>
					<p>
						{row.pac_modality}, {row.year}
					</p>
				</div>
			),
		},
		{
			key: 'reportId',
			header: 'Acciones',
			mobileLabel: 'Acciones',
			render: (row: ReportPeriod) => (
				<Button
					onClick={() => handleView(row.reportId, 'view')}
					disabled={!row.reportId}
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
			<InfoTeacher
				selectedPosition={selectedPosition}
				onPositionChange={setSelectedPosition}
			/>

			<Tabs
				value={currentTab}
				onValueChange={setTab}
				className="mt-4 sm:mt-8"
			>
				{/* TabsList */}
				<TabsList variant="pills" className="mb-4 sm:mb-6">
					<TabsTrigger value="0" className="gap-1.5 sm:gap-2 text-xs sm:text-sm">
						<span className="hidden xs:inline">
							Clases asignadas
						</span>
						<span className="xs:hidden">Clases</span>
					</TabsTrigger>
					<TabsTrigger value="1" className="gap-1.5 sm:gap-2 text-xs sm:text-sm">
						<span className="hidden xs:inline">Informes</span>
						<span className="xs:hidden">Informes</span>
					</TabsTrigger>
				</TabsList>

				{/* Clases */}
				<TabsContent value="0">
					<div className="bg-card border border-card-border rounded-xl shadow-lg shadow-primary/5 overflow-hidden">
						<ResponsiveTable<TCourseClassroom>
							columns={courseColumns}
							data={filteredCourses}
							getRowKey={c => c.id}
							loading={coursesInfo.isLoading || currentUser.isLoading}
							emptyMessage="No hay clases asignadas"
						/>
					</div>
				</TabsContent>

				{/* Informes */}
				<TabsContent value="1">
          <div>
            {academicPeriodInfo.isLoading ||
             academicAssignmentReportsPeriodsInfo.isLoading ? null :
             !currentPeriodReport?.reportId ?
            (
              <div className='flex items-center justify-center'>
                <div className='flex py-3 px-4 rounded-md bg-yellow-500'>
      						<span className='text-1xl font-semibold'>Sin asignación académica para el periodo actual</span>
                </div>
              </div>
            ) : (
            <div className='flex items-center justify-center'>
  						<Button
  							onClick={() =>
  								handleView(
  									currentPeriodReport?.reportId ?? '',
  									'edit'
  								)
  							}
  							disabled={
  								!currentPeriodReport?.reportId
  							}
  							className="w-full cursor-pointer disabled:cursor-not-allowed md:w-auto text-xs sm:text-sm bg-[#C40C54] hover:bg-[#AC0647] hover:shadow-xl hover:shadow-[#C40C54]/20 hover:-translate-y-0.5"
  							variant="default"
  						>
   							<DocumentPlusIcon className="size-3 sm:size-4.5" />
  							<span className="hidden sm:inline">
  								Informe de asignación académica del periodo
  								actual
  							</span>
  							<span className="sm:hidden">
  								Ver informe actual
  							</span>
  						</Button>
            </div>
            )}

						<div className="mt-4 sm:mt-6 bg-white">
							<ResponsiveTable<ReportPeriod>
								columns={reportColumns}
								data={filteredReports}
								getRowKey={r => r.id}
								loading={
									academicAssignmentReportsPeriodsInfo.isLoading
								}
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
