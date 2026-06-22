import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { EPdfFont } from '@config/lib';
import { useGetAcademicAssignmentReportById } from '@api/assignment-reports';
import { TOutputTeacher, useGetTeacherByUserId } from '@api/teachers';
import { useTabWithReset } from '@shared/hooks';
import { Button, Loading, Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/components';
import { PdfFontSelector } from '@shared/components/ui/PdfFontSelector';
import { EActivityType } from '@shared/constants';
import { exportReportActivities, handleActivities, IReportData } from '../utils';
import { AcademicPositionTeacher, TableActivities, TeachingSession } from '../components';

export const CoordinatorAssignmentReport = () => {
	const { id } = useParams();
	const [selectedFont, setSelectedFont] = useState<EPdfFont | undefined>();

	const assignmentReportInfo = useGetAcademicAssignmentReportById(id);
	const teacherInfo = useGetTeacherByUserId(
		(assignmentReportInfo.data &&
			assignmentReportInfo.data.teacher.user.id) ||
			''
	);

	const isLoading = [assignmentReportInfo, teacherInfo].some(
		q => q.isLoading
	);

	const currentPosition = useMemo(() => {
		if (!teacherInfo.data || !assignmentReportInfo.data) return;

		return teacherInfo.data?.positions.find(
			pos =>
				pos.centerDepartmentId ===
				assignmentReportInfo.data?.centerDepartment.id
		);
	}, [teacherInfo.data, assignmentReportInfo.data]);

	const validTabs = ['0', '1', '2', '3', '4', '5', '6'];
	const { currentTab, setTab } = useTabWithReset(validTabs);

	if (isLoading) return <Loading />;

	const generateReport = () => {
		if (!teacherInfo.data || !assignmentReportInfo.data || !currentPosition)
			return;

		const newReport: IReportData = {
			period: assignmentReportInfo.data.period,
			teacherPosition: {
				teacherName: teacherInfo.data.name,
				position: currentPosition.position.name,
				department: currentPosition.department.name,
				faculty: currentPosition.department.faculty.name,
				center: currentPosition.center.name,
			},
			teacherData: teacherInfo.data as TOutputTeacher,
			assignmentReportData: assignmentReportInfo.data,
		};

		return exportReportActivities(newReport, selectedFont);
	};

	const handleFontChange = (font: EPdfFont) => {
		setSelectedFont(font);
	};

	return (
		<>
			<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-5">
				<div>
					<h1 className="text-center text-2xl font-bold mb-4 sm:mb-0 sm:text-left">
						Informe de actividades académicas - Periodo{' '}
						{assignmentReportInfo.data &&
							`No. ${assignmentReportInfo.data.period.pac}, ${assignmentReportInfo.data.period.pac_modality}, ${assignmentReportInfo.data.period.year}`}
					</h1>
					<h2 className="mt-2">Docente: {teacherInfo.data?.name}</h2>
					<h2>Codigo: {teacherInfo.data?.code}</h2>
				</div>
				<div className="flex flex-col items-center sm:flex-row gap-2 mt-5 sm:mt-0">
					<PdfFontSelector onChange={handleFontChange} />
					<Button
						type="submit"
						onClick={generateReport}
						className="justify-center bg-[#C40C54] text-white hover:bg-pink-500 transition flex flex-row gap-2 duration-500 cursor-pointer"
						variant="unstyled"
					>
						<DocumentArrowDownIcon className="size-6" />
						Descargar informe
					</Button>
				</div>
			</div>

			<Tabs
				value={currentTab}
				onValueChange={setTab}
				className="mt-5"
			>
				<TabsList variant="pills">
					<TabsTrigger value="0">Docencia</TabsTrigger>
					<TabsTrigger value="1">
						{EActivityType.Research}
					</TabsTrigger>
					<TabsTrigger value="2">
						{EActivityType.Outreach}
					</TabsTrigger>
					<TabsTrigger value="3">
						{EActivityType.EducationalInnovation}
					</TabsTrigger>
					<TabsTrigger value="4">
						{EActivityType.CurriculumDesignOrRedesign}
					</TabsTrigger>
					<TabsTrigger value="5">
						Cargo de gestión académica
					</TabsTrigger>
					<TabsTrigger value="6">
						{EActivityType.OtherActivities}
					</TabsTrigger>
				</TabsList>

				<TabsContent value="0">
					<TeachingSession
						reportId={id ?? ''}
						data={assignmentReportInfo.data?.teachingSession}
						mode={'view'}
					/>
				</TabsContent>

				<TabsContent value="1">
					<TableActivities
						reportId={id ?? ''}
						activityType={EActivityType.Research}
						activities={handleActivities(
							assignmentReportInfo.data?.complementaryActivities,
							EActivityType.Research
						)}
						mode={'view'}
					/>
				</TabsContent>

				<TabsContent value="2">
					<TableActivities
						reportId={id ?? ''}
						activityType={EActivityType.Outreach}
						activities={handleActivities(
							assignmentReportInfo.data?.complementaryActivities,
							EActivityType.Outreach
						)}
						mode={'view'}
					/>
				</TabsContent>

				<TabsContent value="3">
					<TableActivities
						reportId={id ?? ''}
						activityType={EActivityType.EducationalInnovation}
						activities={handleActivities(
							assignmentReportInfo.data?.complementaryActivities,
							EActivityType.EducationalInnovation
						)}
						mode={'view'}
					/>
				</TabsContent>

				<TabsContent value="4">
					<TableActivities
						reportId={id ?? ''}
						activityType={EActivityType.CurriculumDesignOrRedesign}
						activities={handleActivities(
							assignmentReportInfo.data?.complementaryActivities,
							EActivityType.CurriculumDesignOrRedesign
						)}
						mode={'view'}
					/>
				</TabsContent>

				<TabsContent value="5">
					<AcademicPositionTeacher
						positionTeacher={
							(currentPosition &&
								currentPosition.position.name) ??
							''
						}
					/>
				</TabsContent>

				<TabsContent value="6">
					<TableActivities
						reportId={id ?? ''}
						activityType={EActivityType.OtherActivities}
						activities={handleActivities(
							assignmentReportInfo.data?.complementaryActivities,
							EActivityType.OtherActivities
						)}
						mode={'view'}
					/>
				</TabsContent>
			</Tabs>
		</>
	);
};
