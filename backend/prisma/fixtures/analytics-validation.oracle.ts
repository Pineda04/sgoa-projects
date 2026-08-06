import 'dotenv/config';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'src/generated/prisma/client';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required.');

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
const PERIOD_ID = 'a1000000-0000-4000-8000-000000000009';
const COMPARISON_PERIOD_ID = 'a1000000-0000-4000-8000-000000000010';
const CENTER_DEPARTMENT_ID = 'a1000000-0000-4000-8000-000000000005';
const BUILDING_ID = 'a1000000-0000-4000-8000-000000000007';

type Section = {
  id: string;
  days: string;
  schedule: string;
  studentCount: number | null;
  courseId: string;
  courseCode: string;
  courseName: string;
  uvs: number;
  classroomId: string;
  classroomName: string;
  maxCapacity: number | null;
  roomType: string;
  modality: string;
  teacherId: string;
  teacherName: string;
  teacherCode: string;
  periodId: string;
  centerDepartmentId: string;
};

type Classroom = {
  id: string;
  name: string;
  maxCapacity: number | null;
  roomType: string;
  buildingId: string;
  buildingName: string;
  centerId: string;
  centerName: string;
};

type Inventory = {
  equipmentType: 'digital_blackboard' | 'pc_equipment' | 'air_conditioner';
  equipmentId: string;
  conditionId: string;
  conditionLabel: string;
  classroomId: string;
  classroomName: string;
  buildingId: string;
  buildingName: string;
};

type Staff = {
  id: string;
  name: string;
  code: string;
  contractName: string;
  categoryName: string;
  shiftName: string;
  positionId: string | null;
  positionName: string | null;
};

type Activity = {
  id: string;
  name: string;
  activityTypeId: string;
  activityTypeName: string;
  teacherId: string;
  teacherName: string;
  periodId: string;
  centerDepartmentId: string;
};

type Check = {
  id: string;
  checkDate: string;
  isPresent: boolean;
  blackboardStatus: 'USED' | 'NOT_USED' | 'UNKNOWN' | null;
  teacherId: string;
  teacherName: string;
  buildingId: string;
  buildingName: string;
  centerId: string;
  centerName: string;
  centerDepartmentId: string;
  periodId: string;
  periodLabel: string;
};

const query = <T>(sql: string, ...params: unknown[]) =>
  prisma.$queryRawUnsafe<T[]>(sql, ...params);

function parseDays(value: string): string[] | null {
  const matches = value.match(/Lu|Ma|Mi|Ju|Vi|Sa|Do/g) ?? [];
  return matches.length > 0 && matches.join('') === value && new Set(matches).size === matches.length
    ? matches
    : null;
}

function parseMinutes(value: string): number | null {
  const match = value.trim().match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

function parseSchedule(value: string): { start: string; end: string; startMinutes: number; endMinutes: number } | null {
  const match = value.trim().match(/^(.+?)\s*-\s*(.+?)$/);
  if (!match) return null;
  const startMinutes = parseMinutes(match[1]);
  const endMinutes = parseMinutes(match[2]);
  if (startMinutes === null || endMinutes === null || startMinutes >= endMinutes) return null;
  return {
    start: `${Math.floor(startMinutes / 60).toString().padStart(2, '0')}:${(startMinutes % 60).toString().padStart(2, '0')}`,
    end: `${Math.floor(endMinutes / 60).toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`,
    startMinutes,
    endMinutes,
  };
}

function percentage(numerator: number, denominator: number): number | null {
  return denominator ? (numerator / denominator) * 100 : null;
}

function distribution(rows: { id: string; label: string }[], denominator: number) {
  const counts = new Map<string, { id: string; label: string; value: number }>();
  for (const row of rows) {
    const current = counts.get(row.id) ?? { ...row, value: 0 };
    current.value += 1;
    counts.set(row.id, current);
  }
  return [...counts.values()]
    .sort((left, right) => left.label.localeCompare(right.label, 'es') || left.id.localeCompare(right.id))
    .map((item) => ({ ...item, percentage: percentage(item.value, denominator) ?? 0 }));
}

async function loadSections(periodId: string): Promise<Section[]> {
  return query<Section>(
    `SELECT
       cc.id,
       cc.days,
       cc.section AS schedule,
       cc."studentCount" AS "studentCount",
       cc."courseId" AS "courseId",
       course.code AS "courseCode",
       course.name AS "courseName",
       course.uvs,
       cc."classroomId" AS "classroomId",
       classroom.name AS "classroomName",
       classroom."maxCapacity" AS "maxCapacity",
       room_type.description AS "roomType",
       modality.name AS modality,
       teacher.id AS "teacherId",
       teacher_user.name AS "teacherName",
       teacher_user.code AS "teacherCode",
       report."periodId" AS "periodId",
       report."centerDepartmentId" AS "centerDepartmentId"
     FROM academic.course_classrooms cc
     JOIN academic.courses course ON course.id = cc."courseId"
     JOIN infraestructure.classrooms classroom ON classroom.id = cc."classroomId"
     JOIN infraestructure.room_types room_type ON room_type.id = classroom."roomTypeId"
     JOIN academic.modalities modality ON modality.id = cc."modalityId"
     JOIN academic.teaching_sessions session ON session.id = cc."teachingSessionId"
     JOIN academic.academic_assignment_reports report ON report.id = session."assignmentReportId"
     JOIN academic.teachers teacher ON teacher.id = report."teacherId"
     JOIN auth.users teacher_user ON teacher_user.id = teacher."userId"
     WHERE report."periodId" = $1 AND report."centerDepartmentId" = $2
     ORDER BY cc.id`,
    periodId,
    CENTER_DEPARTMENT_ID,
  );
}

async function loadClassrooms(): Promise<Classroom[]> {
  return query<Classroom>(
    `SELECT
       classroom.id,
       classroom.name,
       classroom."maxCapacity" AS "maxCapacity",
       room_type.description AS "roomType",
       building.id AS "buildingId",
       building.name AS "buildingName",
       center.id AS "centerId",
       center.name AS "centerName"
     FROM infraestructure.classrooms classroom
     JOIN infraestructure.room_types room_type ON room_type.id = classroom."roomTypeId"
     JOIN infraestructure.buildings building ON building.id = classroom."buildingId"
     JOIN academic.centers center ON center.id = building."centerId"
     WHERE classroom."activeStatus" = true
       AND classroom.id IN (
         SELECT relation."classroomId"
         FROM infraestructure.classrooms_departments relation
         WHERE relation."departmentId" = $1
       )
       AND lower(trim(room_type.description)) <> 'espacio virtual'
     ORDER BY classroom.name`,
    'a1000000-0000-4000-8000-000000000003',
  );
}

async function loadInventory(classroomIds: string[]): Promise<Inventory[]> {
  const idsSql = classroomIds.map((id) => `'${id}'`).join(',');
  return query<Inventory>(
    `SELECT 'digital_blackboard' AS "equipmentType", item.id AS "equipmentId",
       item."conditionId" AS "conditionId", condition.status AS "conditionLabel",
       item."classroomId" AS "classroomId", classroom.name AS "classroomName",
       building.id AS "buildingId", building.name AS "buildingName"
     FROM inventory.digital_blackboards item
     JOIN inventory.conditions condition ON condition.id = item."conditionId"
     JOIN infraestructure.classrooms classroom ON classroom.id = item."classroomId"
     JOIN infraestructure.buildings building ON building.id = classroom."buildingId"
     WHERE item."classroomId" IN (${idsSql})
     UNION ALL
     SELECT 'pc_equipment', item.id, item."conditionId", condition.status,
       item."classroomId", classroom.name, building.id, building.name
     FROM inventory.pc_equipments item
     JOIN inventory.conditions condition ON condition.id = item."conditionId"
     JOIN infraestructure.classrooms classroom ON classroom.id = item."classroomId"
     JOIN infraestructure.buildings building ON building.id = classroom."buildingId"
     WHERE item."classroomId" IN (${idsSql})
     UNION ALL
     SELECT 'air_conditioner', item.id, item."conditionId", condition.status,
       item."classroomId", classroom.name, building.id, building.name
     FROM inventory.air_conditioners item
     JOIN inventory.conditions condition ON condition.id = item."conditionId"
     JOIN infraestructure.classrooms classroom ON classroom.id = item."classroomId"
     JOIN infraestructure.buildings building ON building.id = classroom."buildingId"
     WHERE item."classroomId" IN (${idsSql})`,
  );
}

async function loadStaff(): Promise<Staff[]> {
  return query<Staff>(
    `SELECT
       teacher.id,
       user_row.name,
       user_row.code,
       contract.name AS "contractName",
       category.name AS "categoryName",
       shift.name AS "shiftName",
       position.id AS "positionId",
       position.name AS "positionName"
     FROM academic.teachers teacher
     JOIN auth.users user_row ON user_row.id = teacher."userId"
     JOIN academic.contract_types contract ON contract.id = teacher."contractTypeId"
     JOIN academic.teacher_categories category ON category.id = teacher."categoryId"
     JOIN academic.shifts shift ON shift.id = teacher."shiftId"
     LEFT JOIN academic.teacher_department_position appointment
       ON appointment."teacherId" = teacher.id
       AND appointment."centerDepartmentId" = $1
       AND appointment."startDate" <= now()
       AND (appointment."endDate" IS NULL OR appointment."endDate" >= now())
     LEFT JOIN academic.positions position ON position.id = appointment."positionId"
     WHERE user_row."activeStatus" = true
       AND appointment.id IS NOT NULL
     ORDER BY teacher.id`,
    CENTER_DEPARTMENT_ID,
  );
}

async function loadActivities(): Promise<Activity[]> {
  return query<Activity>(
    `SELECT
       activity.id,
       activity.name,
       type.id AS "activityTypeId",
       type.name AS "activityTypeName",
       report."teacherId" AS "teacherId",
       user_row.name AS "teacherName",
       report."periodId" AS "periodId",
       report."centerDepartmentId" AS "centerDepartmentId"
     FROM academic.complementary_activities activity
     JOIN academic.activity_types type ON type.id = activity."activityTypeId"
     JOIN academic.academic_assignment_reports report ON report.id = activity."assignmentReportId"
     JOIN academic.teachers teacher ON teacher.id = report."teacherId"
     JOIN auth.users user_row ON user_row.id = teacher."userId"
     WHERE report."periodId" = $1 AND report."centerDepartmentId" = $2
     ORDER BY activity.id`,
    PERIOD_ID,
    CENTER_DEPARTMENT_ID,
  );
}

async function loadChecks(): Promise<Check[]> {
  return query<Check>(
    `SELECT
       check_row.id,
       check_row."checkDate"::text AS "checkDate",
       check_row."isPresent" AS "isPresent",
       check_row."digitalBlackboardUseStatus"::text AS "blackboardStatus",
       report."teacherId" AS "teacherId",
       teacher_user.name AS "teacherName",
       building.id AS "buildingId",
       building.name AS "buildingName",
       center.id AS "centerId",
       center.name AS "centerName",
       report."centerDepartmentId" AS "centerDepartmentId",
       report."periodId" AS "periodId",
       concat('No. ', period.pac, ', ', period.pac_modality, ', ', period.year) AS "periodLabel"
     FROM academic.schedule_compliance_checks check_row
     JOIN academic.course_classrooms cc ON cc.id = check_row."courseClassroomId"
     JOIN academic.teaching_sessions session ON session.id = cc."teachingSessionId"
     JOIN academic.academic_assignment_reports report ON report.id = session."assignmentReportId"
     JOIN academic.teachers teacher ON teacher.id = report."teacherId"
     JOIN auth.users teacher_user ON teacher_user.id = teacher."userId"
     JOIN infraestructure.buildings building ON building.id = check_row."buildingId"
     JOIN academic.centers center ON center.id = building."centerId"
     JOIN academic.academic_periods period ON period.id = report."periodId"
     WHERE report."periodId" = $1
       AND check_row."buildingId" = $2
       AND check_row."checkDate" >= TIMESTAMP '2026-08-04 00:00:00'
       AND check_row."checkDate" < TIMESTAMP '2026-08-08 00:00:00'
     ORDER BY check_row.id`,
    PERIOD_ID,
    BUILDING_ID,
  );
}

async function main() {
  const sections = await loadSections(PERIOD_ID);
  const comparisonSections = await loadSections(COMPARISON_PERIOD_ID);
  const classrooms = await loadClassrooms();
  const inventory = await loadInventory(classrooms.map(({ id }) => id));
  const staff = await loadStaff();
  const activities = await loadActivities();
  const checks = await loadChecks();

  const uniqueCourses = new Set(sections.map(({ courseId }) => courseId));
  const uniqueTeachers = new Set(sections.map(({ teacherId }) => teacherId));
  const validScheduleSections = sections.filter(({ days, schedule }) => parseDays(days) && parseSchedule(schedule));
  const scheduleGroups = new Map<string, { dayOfWeek: string; startTime: string; endTime: string; meetingCount: number }>();
  for (const row of validScheduleSections) {
    const days = parseDays(row.days)!;
    const schedule = parseSchedule(row.schedule)!;
    for (const dayOfWeek of days) {
      const key = `${dayOfWeek}:${schedule.start}:${schedule.end}`;
      const current = scheduleGroups.get(key);
      if (current) current.meetingCount += 1;
      else scheduleGroups.set(key, { dayOfWeek, startTime: schedule.start, endTime: schedule.end, meetingCount: 1 });
    }
  }

  const knownEnrollments = sections.filter(({ studentCount }) => studentCount !== null);
  const physicalSections = sections.filter(({ modality }) => modality !== 'Espacio Virtual');
  const comparableSections = physicalSections.filter(({ studentCount, maxCapacity }) => studentCount !== null && maxCapacity !== null && maxCapacity > 0);
  const enrollmentSum = knownEnrollments.reduce((sum, row) => sum + row.studentCount!, 0);
  const capacitySum = comparableSections.reduce((sum, row) => sum + row.maxCapacity!, 0);
  const physicalEnrollmentSum = comparableSections.reduce((sum, row) => sum + row.studentCount!, 0);
  const equippedClassroomIds = new Set(inventory.filter(({ equipmentType }) => equipmentType === 'digital_blackboard').map(({ classroomId }) => classroomId));
  const equippedSections = sections.filter(({ classroomId, modality }) => equippedClassroomIds.has(classroomId) && modality !== 'Espacio Virtual');
  const knownEquippedSections = equippedSections.filter(({ studentCount }) => studentCount !== null);
  const activeTeacherIds = new Set(staff.map(({ id }) => id));
  const reportedActivityTeacherIds = new Set(activities.map(({ teacherId }) => teacherId));
  const activeWithReport = [...reportedActivityTeacherIds].filter((id) => activeTeacherIds.has(id)).length;

  const byType = distribution(inventory.map(({ equipmentType }) => ({ id: equipmentType, label: equipmentType })), inventory.length);
  const byCondition = distribution(inventory.map(({ conditionId, conditionLabel }) => ({ id: conditionId, label: conditionLabel })), inventory.length);
  const byBuilding = distribution(inventory.map(({ buildingId, buildingName }) => ({ id: buildingId, label: buildingName })), inventory.length);
  const activityByType = distribution(activities.map(({ activityTypeId, activityTypeName }) => ({ id: activityTypeId, label: activityTypeName })), activities.length);
  const activityByTeacher = distribution(activities.map(({ teacherId, teacherName }) => ({ id: teacherId, label: teacherName })), activities.length);
  const activityByCenter = distribution(activities.map(({ centerDepartmentId }) => ({ id: centerDepartmentId, label: centerDepartmentId })), activities.length);

  const used = checks.filter(({ blackboardStatus }) => blackboardStatus === 'USED').length;
  const notUsed = checks.filter(({ blackboardStatus }) => blackboardStatus === 'NOT_USED').length;
  const unknown = checks.filter(({ blackboardStatus }) => blackboardStatus === 'UNKNOWN').length;
  const observedDenominator = used + notUsed;
  const observedTotal = observedDenominator + unknown;

  const result = {
    generatedAt: new Date().toISOString(),
    source: 'independent raw SQL oracle',
    filters: { periodId: PERIOD_ID, comparisonPeriodId: COMPARISON_PERIOD_ID, centerDepartmentId: CENTER_DEPARTMENT_ID, buildingId: BUILDING_ID },
    counts: {
      sectionsP1: sections.length,
      sectionsP2: comparisonSections.length,
      eligibleClassrooms: classrooms.length,
      inventory: inventory.length,
      staff: staff.length,
      activities: activities.length,
      checks: checks.length,
    },
    academicLoad: {
      offeredSections: sections.length,
      distinctCourses: uniqueCourses.size,
      assignedUvs: sections.reduce((sum, row) => sum + row.uvs, 0),
      assignedTeachers: uniqueTeachers.size,
      averageSectionsPerTeacher: sections.length / uniqueTeachers.size,
      averageUvsPerTeacher: sections.reduce((sum, row) => sum + row.uvs, 0) / uniqueTeachers.size,
      scheduleDistribution: {
        items: [...scheduleGroups.values()].sort((left, right) => left.dayOfWeek.localeCompare(right.dayOfWeek) || left.startTime.localeCompare(right.startTime)),
        coverage: { included: validScheduleSections.length, total: sections.length, excluded: sections.length - validScheduleSections.length, reasons: ['invalid_schedule_days', 'invalid_schedule_section'] },
      },
      comparison: { offeredSections: comparisonSections.length, absoluteChange: sections.length - comparisonSections.length, percentageChange: ((sections.length - comparisonSections.length) / comparisonSections.length) * 100 },
    },
    enrollment: {
      reportedEnrollments: enrollmentSum,
      averageEnrollmentPerSection: enrollmentSum / knownEnrollments.length,
      sectionsOverCapacity: comparableSections.filter(({ studentCount, maxCapacity }) => studentCount! > maxCapacity!).length,
      availablePhysicalSeats: comparableSections.reduce((sum, row) => sum + Math.max(0, row.maxCapacity! - row.studentCount!), 0),
      occupancyRate: (physicalEnrollmentSum / capacitySum) * 100,
      enrollmentDataCoverage: (knownEnrollments.length / sections.length) * 100,
      enrollmentCoverage: { included: knownEnrollments.length, total: sections.length, excluded: sections.length - knownEnrollments.length },
      capacityCoverage: { included: comparableSections.length, total: physicalSections.length, excluded: physicalSections.length - comparableSections.length },
    },
    classroomAvailability: {
      eligibleClassrooms: classrooms.length,
      occupiedClassrooms: 1,
      availableClassrooms: 1,
      indeterminateClassrooms: 1,
      occupancyRate: null,
      query: { dayOfWeek: 'Lu', startTime: '08:30', endTime: '09:30' },
    },
    classroomCapacity: {
      installedCapacity: classrooms.filter(({ maxCapacity }) => maxCapacity !== null && maxCapacity > 0).reduce((sum, row) => sum + row.maxCapacity!, 0),
      capacityDataCoverage: (classrooms.filter(({ maxCapacity }) => maxCapacity !== null && maxCapacity > 0).length / classrooms.length) * 100,
    },
    technology: {
      eligibleClassrooms: classrooms.length,
      equippedClassrooms: equippedClassroomIds.size,
      digitalBlackboardCoverage: (equippedClassroomIds.size / classrooms.length) * 100,
      knownEnrollmentsInEquippedClassrooms: knownEquippedSections.reduce((sum, row) => sum + row.studentCount!, 0),
      equippedEnrollmentDataCoverage: (knownEquippedSections.length / equippedSections.length) * 100,
      totalEquipment: inventory.length,
      distributions: { byType, byCondition, byBuilding },
    },
    staff: {
      activeTeachers: activeTeacherIds.size,
      byContract: distribution(staff.map(({ id, contractName }) => ({ id: contractName, label: contractName })), staff.length),
      byCategory: distribution(staff.map(({ id, categoryName }) => ({ id: categoryName, label: categoryName })), staff.length),
      byShift: distribution(staff.map(({ id, shiftName }) => ({ id: shiftName, label: shiftName })), staff.length),
      byCurrentPosition: distribution(staff.filter(({ positionId }) => positionId).map(({ positionId, positionName }) => ({ id: positionId!, label: positionName! })), staff.length),
    },
    activities: {
      totalActivities: activities.length,
      reportedTeachers: reportedActivityTeacherIds.size,
      averageActivitiesPerReportedTeacher: activities.length / reportedActivityTeacherIds.size,
      activeTeacherReportCoverage: (activeWithReport / activeTeacherIds.size) * 100,
      distributions: { byType: activityByType, byTeacher: activityByTeacher, byCenter: activityByCenter },
    },
    monitoring: {
      totalChecks: checks.length,
      presentChecks: checks.filter(({ isPresent }) => isPresent).length,
      absentChecks: checks.filter(({ isPresent }) => !isPresent).length,
      complianceRate: (checks.filter(({ isPresent }) => isPresent).length / checks.length) * 100,
      observedBlackboardUseRate: (used / observedDenominator) * 100,
      blackboardObservationCoverage: (observedDenominator / observedTotal) * 100,
      blackboardUseStatus: { USED: used, NOT_USED: notUsed, UNKNOWN: unknown, missing: checks.filter(({ blackboardStatus }) => blackboardStatus === null).length },
    },
    detailTotals: {
      teacher_load: uniqueTeachers.size,
      enrollment_capacity: sections.length,
      classroom_availability: classrooms.length,
      installed_capacity: classrooms.length,
      equipped_classrooms: classrooms.length,
      equipped_classroom_enrollment: equippedSections.length,
      equipment_inventory: inventory.length,
      staff_current: staff.length,
      activities: activities.length,
      monitoring_checks: checks.length,
      digital_blackboard_use: checks.filter(({ blackboardStatus }) => blackboardStatus !== null).length,
    },
  };

  const outputPath = process.env.ANALYTICS_ORACLE_OUTPUT;
  if (outputPath) {
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
  }
  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
