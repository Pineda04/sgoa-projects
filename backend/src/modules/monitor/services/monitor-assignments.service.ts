import { Injectable } from '@nestjs/common';
import { startOfDay } from 'date-fns';
import { PrismaService } from 'src/prisma/prisma.service';
import { AcademicPeriodsService } from 'src/modules/teaching-assignment/services/academic-periods.service';
import {
  TMonitorBuildingAssignments,
  TMonitorClassroomAssignments,
} from '../types';

const DAY_ABBREVIATIONS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

@Injectable()
export class MonitorAssignmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly academicPeriodsService: AcademicPeriodsService,
  ) {}

  async findCurrentAssignments(): Promise<TMonitorBuildingAssignments[]> {
    const currentPeriod =
      await this.academicPeriodsService.currentAcademicPeriod();
    const today = startOfDay(new Date());
    const todayAbbreviation = DAY_ABBREVIATIONS[today.getDay()];

    const courseClassrooms = await this.prisma.courseClassroom.findMany({
      where: {
        days: { contains: todayAbbreviation },
        teachingSession: {
          assignmentReport: {
            periodId: currentPeriod.id,
          },
        },
      },
      include: {
        course: { select: { name: true, code: true } },
        classroom: {
          select: {
            id: true,
            name: true,
            building: { select: { id: true, name: true } },
          },
        },
        teachingSession: {
          select: {
            assignmentReport: {
              select: {
                teacher: {
                  select: {
                    id: true,
                    user: { select: { name: true } },
                  },
                },
              },
            },
          },
        },
        scheduleComplianceChecks: {
          where: { checkDate: today },
          select: {
            id: true,
            isPresent: true,
            checkTime: true,
            observation: true,
          },
        },
      },
    });

    const buildingsMap = new Map<string, TMonitorBuildingAssignments>();

    for (const courseClassroom of courseClassrooms) {
      const { building, ...classroom } = courseClassroom.classroom;

      if (!buildingsMap.has(building.id)) {
        buildingsMap.set(building.id, {
          buildingId: building.id,
          buildingName: building.name,
          classrooms: [],
        });
      }

      const buildingEntry = buildingsMap.get(building.id)!;

      let classroomEntry = buildingEntry.classrooms.find(
        (c) => c.classroomId === classroom.id,
      );

      if (!classroomEntry) {
        classroomEntry = {
          classroomId: classroom.id,
          classroomName: classroom.name,
          assignments: [],
        } as TMonitorClassroomAssignments;
        buildingEntry.classrooms.push(classroomEntry);
      }

      const [check] = courseClassroom.scheduleComplianceChecks;
      const teacher = courseClassroom.teachingSession.assignmentReport.teacher;

      classroomEntry.assignments.push({
        courseClassroomId: courseClassroom.id,
        courseName: courseClassroom.course.name,
        courseCode: courseClassroom.course.code,
        groupCode: courseClassroom.groupCode,
        section: courseClassroom.section,
        days: courseClassroom.days,
        teacher: {
          id: teacher.id,
          name: teacher.user.name,
        },
        check: check
          ? {
              id: check.id,
              isPresent: check.isPresent,
              checkTime: check.checkTime,
              observation: check.observation,
            }
          : null,
      });
    }

    return Array.from(buildingsMap.values());
  }

  async findBuildings(): Promise<{ id: string; name: string }[]> {
    return this.prisma.building.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }
}
