import { useState, useRef, useEffect } from 'react';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { EPdfFont } from '@config/lib';
import { useUser } from '@config/providers';
import { useGetAcademicAssignmentReportById } from '@api/assignment-reports';
import { useGetTeacherPosition } from '@api/teachers';
import { useTabWithReset } from '@shared/hooks';
import { Button, Loading, Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/components';
import { PdfFontSelector } from '@shared/components/ui/PdfFontSelector';
import { EActivityType } from '@shared/constants';
import {
	TableActivities,
	AcademicPositionTeacher,
	TeachingSession,
} from '../components';
import {
	IReportData,
	exportReportActivities,
	handleActivities,
} from '../utils';

export const AcademicAssignmentReport = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const isFirstRender = useRef(true);
	const [mode, setMode] = useState<'edit' | 'view'>('view');
	const [selectedFont, setSelectedFont] = useState<EPdfFont | undefined>();

	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			let initialMode: 'edit' | 'view' | undefined = (
				location.state as { mode?: 'edit' | 'view' }
			)?.mode;

			if (!initialMode) {
				const storedMode = sessionStorage.getItem(
					'academicReport_mode'
				);
				if (storedMode === 'edit' || storedMode === 'view') {
					initialMode = storedMode;
				}
			}

			if (initialMode === 'edit' || initialMode === 'view') {
				setMode(initialMode);
			}
		}
	}, []);

	const currentUser = useUser();
	const assignmentReportInfo = useGetAcademicAssignmentReportById(id);
	const teacherPositionInfo = useGetTeacherPosition(
		(assignmentReportInfo.data &&
			assignmentReportInfo.data.centerDepartment.id) ||
			''
	);

	const isLoading = [
		currentUser,
		assignmentReportInfo,
		teacherPositionInfo,
	].some(q => q.isLoading);

	const validTabs = ['0', '1', '2', '3', '4', '5', '6'];
	const { currentTab, setTab } = useTabWithReset(validTabs);

	if (isLoading) return <Loading />;
	if (assignmentReportInfo.isError) {
		navigate(-1);
	}

	const generateReport = () => {
		if (
			!currentUser.user ||
			!assignmentReportInfo.data ||
			!teacherPositionInfo.data
		)
			return;

		const newReport: IReportData = {
			period: assignmentReportInfo.data.period,
			teacherPosition: teacherPositionInfo.data,
			teacherData: currentUser.user,
			assignmentReportData: assignmentReportInfo.data,
		};

		return exportReportActivities(newReport, selectedFont);
	};

	const handleFontChange = (font: EPdfFont) => {
		setSelectedFont(font);
	};

	return (
		<>
			<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
				<h1 className="text-center text-2xl font-bold mb-4 sm:mb-0 sm:text-left">
					Informe de actividades académicas - Periodo{' '}
					{assignmentReportInfo.data &&
						`No. ${assignmentReportInfo.data.period.pac}, ${assignmentReportInfo.data.period.pac_modality}, ${assignmentReportInfo.data.period.year}`}
				</h1>
				<div className="flex flex-col items-center sm:flex-row gap-2">
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
				<TabsList>
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
						mode={mode}
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
						mode={mode}
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
						mode={mode}
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
						mode={mode}
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
						mode={mode}
					/>
				</TabsContent>

				<TabsContent value="5">
					<AcademicPositionTeacher
						positionTeacher={
							(teacherPositionInfo.data &&
								teacherPositionInfo.data.position) ??
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
						mode={mode}
					/>
				</TabsContent>
			</Tabs>
		</>
	);
};
