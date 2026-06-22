import z from "zod";
import { TComplementaryActivity } from "../activities";
import { TCenterDepartment } from "../centers";
import { TAcademicCommonProps, TCurrentAcademicPeriod } from "../periods/periods.types";
import { TTeachingSession } from "../teachers";
import { planificationSchema } from "@features/academic/planifications/schemas";

export type TAssignmentReport = {
	id: string;
	periodId: string;
	period: TCurrentAcademicPeriod;
	teacher: {
		id: string;
		user: {
			id: string;
			name: string;
			code: string;
		};
	};
	centerDepartment: TCenterDepartment & {
		center: TAcademicCommonProps;
		department: TAcademicCommonProps;
	};
	teachingSession: TTeachingSession;
	complementaryActivities: TComplementaryActivity[];
};

export type TPlanification = z.infer<typeof planificationSchema>;

export type TPlanificationWithErrors = TPlanification & {
	id: string | number;
	errors: string[];
};
