import 'dotenv/config';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import * as argon from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'src/generated/prisma/client';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required.');

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });

const FIXTURE_PASSWORD = process.env.ANALYTICS_FIXTURE_PASSWORD ?? 'Validation123!';

const ids = {
  faculty: 'a1000000-0000-4000-8000-000000000001',
  center: 'a1000000-0000-4000-8000-000000000002',
  department1: 'a1000000-0000-4000-8000-000000000003',
  department2: 'a1000000-0000-4000-8000-000000000004',
  centerDepartment1: 'a1000000-0000-4000-8000-000000000005',
  centerDepartment2: 'a1000000-0000-4000-8000-000000000006',
  building1: 'a1000000-0000-4000-8000-000000000007',
  building2: 'a1000000-0000-4000-8000-000000000008',
  period1: 'a1000000-0000-4000-8000-000000000009',
  period2: 'a1000000-0000-4000-8000-000000000010',
  periodZero: 'a1000000-0000-4000-8000-000000000011',
  course1: 'a1000000-0000-4000-8000-000000000012',
  course2: 'a1000000-0000-4000-8000-000000000013',
  course3: 'a1000000-0000-4000-8000-000000000014',
  classroom1: 'a1000000-0000-4000-8000-000000000015',
  classroom2: 'a1000000-0000-4000-8000-000000000016',
  classroom3: 'a1000000-0000-4000-8000-000000000017',
  classroomVirtual: 'a1000000-0000-4000-8000-000000000018',
  classroomInactive: 'a1000000-0000-4000-8000-000000000019',
  classroom2Scope: 'a1000000-0000-4000-8000-000000000020',
  board: 'a1000000-0000-4000-8000-000000000021',
  pc1: 'a1000000-0000-4000-8000-000000000022',
  pc2: 'a1000000-0000-4000-8000-000000000023',
  airConditioner: 'a1000000-0000-4000-8000-000000000024',
  role: 'a1000000-0000-4000-8000-000000000025',
  userTeacher1: 'a1000000-0000-4000-8000-000000000026',
  userTeacher2: 'a1000000-0000-4000-8000-000000000027',
  userTeacher3: 'a1000000-0000-4000-8000-000000000028',
  userCoordinator1: 'a1000000-0000-4000-8000-000000000029',
  userCoordinator2: 'a1000000-0000-4000-8000-000000000030',
  userMonitor1: 'a1000000-0000-4000-8000-000000000031',
  userMonitor2: 'a1000000-0000-4000-8000-000000000032',
  userInactive: 'a1000000-0000-4000-8000-000000000033',
  teacher1: 'a1000000-0000-4000-8000-000000000034',
  teacher2: 'a1000000-0000-4000-8000-000000000035',
  teacher3: 'a1000000-0000-4000-8000-000000000036',
  teacherCoordinator1: 'a1000000-0000-4000-8000-000000000037',
  teacherCoordinator2: 'a1000000-0000-4000-8000-000000000038',
  report1: 'a1000000-0000-4000-8000-000000000039',
  report2: 'a1000000-0000-4000-8000-000000000040',
  report3: 'a1000000-0000-4000-8000-000000000041',
  session1: 'a1000000-0000-4000-8000-000000000042',
  session2: 'a1000000-0000-4000-8000-000000000043',
  session3: 'a1000000-0000-4000-8000-000000000044',
  section1: 'a1000000-0000-4000-8000-000000000045',
  section2: 'a1000000-0000-4000-8000-000000000046',
  section3: 'a1000000-0000-4000-8000-000000000047',
  section4: 'a1000000-0000-4000-8000-000000000048',
  section5: 'a1000000-0000-4000-8000-000000000049',
  section6: 'a1000000-0000-4000-8000-000000000050',
  section7: 'a1000000-0000-4000-8000-000000000051',
  activity1: 'a1000000-0000-4000-8000-000000000052',
  activity2: 'a1000000-0000-4000-8000-000000000053',
  activity3: 'a1000000-0000-4000-8000-000000000054',
  check1: 'a1000000-0000-4000-8000-000000000055',
  check2: 'a1000000-0000-4000-8000-000000000056',
  check3: 'a1000000-0000-4000-8000-000000000057',
  check4: 'a1000000-0000-4000-8000-000000000058',
  classroomDepartment1: 'a1000000-0000-4000-8000-000000000059',
  classroomDepartment2: 'a1000000-0000-4000-8000-000000000060',
  classroomDepartment3: 'a1000000-0000-4000-8000-000000000061',
  classroomDepartmentVirtual: 'a1000000-0000-4000-8000-000000000062',
  classroomDepartmentInactive: 'a1000000-0000-4000-8000-000000000063',
  classroomDepartmentScope2: 'a1000000-0000-4000-8000-000000000064',
} as const;

const upsertById = async <T extends { id: string }>(
  upsert: (args: { where: { id: string }; update: Omit<T, 'id'>; create: T }) => Promise<unknown>,
  data: T,
) => upsert({ where: { id: data.id }, update: data, create: data });

async function main() {
  const now = new Date();
  const validFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const validUntil = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  const passwordHash = await argon.hash(FIXTURE_PASSWORD);

  const [faculty, category, contract, shift, teacherPosition, headPosition] =
    await Promise.all([
      prisma.faculty.upsert({
        where: { id: ids.faculty },
        update: { name: 'AV Facultad de Validación' },
        create: { id: ids.faculty, name: 'AV Facultad de Validación' },
      }),
      prisma.teacherCategory.findFirst({ orderBy: { name: 'asc' } }),
      prisma.contractType.findFirst({ orderBy: { name: 'asc' } }),
      prisma.shift.findFirst({ orderBy: { name: 'asc' } }),
      prisma.position.findUnique({ where: { name: 'Docente' } }),
      prisma.position.findUnique({ where: { name: 'Jefe de Departamento' } }),
    ]);

  if (!category || !contract || !shift || !teacherPosition || !headPosition) {
    throw new Error('Required teacher catalogs are missing. Run the seed first.');
  }

  const center = await prisma.center.upsert({
    where: { id: ids.center },
    update: { name: 'AV Centro de Validación' },
    create: { id: ids.center, name: 'AV Centro de Validación' },
  });
  const department1 = await prisma.department.upsert({
    where: { id: ids.department1 },
    update: { name: 'AV Departamento Principal', facultyId: faculty.id },
    create: { id: ids.department1, name: 'AV Departamento Principal', facultyId: faculty.id },
  });
  const department2 = await prisma.department.upsert({
    where: { id: ids.department2 },
    update: { name: 'AV Departamento Secundario', facultyId: faculty.id },
    create: { id: ids.department2, name: 'AV Departamento Secundario', facultyId: faculty.id },
  });
  const centerDepartment1 = await prisma.centerDepartment.upsert({
    where: { id: ids.centerDepartment1 },
    update: { centerId: center.id, departmentId: department1.id },
    create: { id: ids.centerDepartment1, centerId: center.id, departmentId: department1.id },
  });
  const centerDepartment2 = await prisma.centerDepartment.upsert({
    where: { id: ids.centerDepartment2 },
    update: { centerId: center.id, departmentId: department2.id },
    create: { id: ids.centerDepartment2, centerId: center.id, departmentId: department2.id },
  });

  const building1 = await prisma.building.upsert({
    where: { id: ids.building1 },
    update: { name: 'AV Edificio Principal', centerId: center.id },
    create: { id: ids.building1, name: 'AV Edificio Principal', centerId: center.id },
  });
  const building2 = await prisma.building.upsert({
    where: { id: ids.building2 },
    update: { name: 'AV Edificio Secundario', centerId: center.id },
    create: { id: ids.building2, name: 'AV Edificio Secundario', centerId: center.id },
  });

  const period1 = await prisma.academicPeriod.upsert({
    where: { id: ids.period1 },
    update: {
      year: 2091,
      pac: 1,
      pac_modality: 'Trimestre',
      startDate: new Date('2091-01-01T06:00:00.000Z'),
      endDate: new Date('2091-04-30T06:00:00.000Z'),
    },
    create: {
      id: ids.period1,
      year: 2091,
      pac: 1,
      pac_modality: 'Trimestre',
      startDate: new Date('2091-01-01T06:00:00.000Z'),
      endDate: new Date('2091-04-30T06:00:00.000Z'),
    },
  });
  const period2 = await prisma.academicPeriod.upsert({
    where: { id: ids.period2 },
    update: {
      year: 2091,
      pac: 2,
      pac_modality: 'Trimestre',
      startDate: new Date('2091-05-01T06:00:00.000Z'),
      endDate: new Date('2091-08-31T06:00:00.000Z'),
    },
    create: {
      id: ids.period2,
      year: 2091,
      pac: 2,
      pac_modality: 'Trimestre',
      startDate: new Date('2091-05-01T06:00:00.000Z'),
      endDate: new Date('2091-08-31T06:00:00.000Z'),
    },
  });
  const periodZero = await prisma.academicPeriod.upsert({
    where: { id: ids.periodZero },
    update: {
      year: 2092,
      pac: 1,
      pac_modality: 'Trimestre',
      startDate: new Date('2092-01-01T06:00:00.000Z'),
      endDate: new Date('2092-04-30T06:00:00.000Z'),
    },
    create: {
      id: ids.periodZero,
      year: 2092,
      pac: 1,
      pac_modality: 'Trimestre',
      startDate: new Date('2092-01-01T06:00:00.000Z'),
      endDate: new Date('2092-04-30T06:00:00.000Z'),
    },
  });

  const physicalRoomType =
    (await prisma.roomType.findFirst({ where: { description: 'Aula' } })) ??
    (await prisma.roomType.create({ data: { description: 'Aula' } }));
  const virtualRoomType =
    (await prisma.roomType.findFirst({ where: { description: 'Espacio Virtual' } })) ??
    (await prisma.roomType.create({ data: { description: 'Espacio Virtual' } }));
  const presentialModality =
    (await prisma.modality.findUnique({ where: { name: 'Presencial' } })) ??
    (await prisma.modality.create({ data: { name: 'Presencial' } }));
  const virtualModality =
    (await prisma.modality.findUnique({ where: { name: 'Espacio Virtual' } })) ??
    (await prisma.modality.create({ data: { name: 'Espacio Virtual' } }));
  const brand = await prisma.brand.findFirst({ orderBy: { name: 'asc' } });
  const condition = await prisma.condition.findFirst({ orderBy: { status: 'asc' } });
  const monitorType = await prisma.monitorType.findFirst({ orderBy: { description: 'asc' } });
  const monitorSize = await prisma.monitorSize.findFirst({ orderBy: { description: 'asc' } });
  const pcType = await prisma.pcType.findFirst({ orderBy: { description: 'asc' } });
  if (!brand || !condition || !monitorType || !monitorSize || !pcType) {
    throw new Error('Required inventory catalogs are missing. Run the seed first.');
  }

  const classroomData = [
    {
      id: ids.classroom1,
      name: 'AV-A101',
      maxCapacity: 30,
      roomTypeId: physicalRoomType.id,
      buildingId: building1.id,
      activeStatus: true,
    },
    {
      id: ids.classroom2,
      name: 'AV-A102',
      maxCapacity: 20,
      roomTypeId: physicalRoomType.id,
      buildingId: building1.id,
      activeStatus: true,
    },
    {
      id: ids.classroom3,
      name: 'AV-A103',
      maxCapacity: null,
      roomTypeId: physicalRoomType.id,
      buildingId: building1.id,
      activeStatus: true,
    },
    {
      id: ids.classroomVirtual,
      name: 'AV-VIRTUAL',
      maxCapacity: null,
      roomTypeId: virtualRoomType.id,
      buildingId: building1.id,
      activeStatus: true,
    },
    {
      id: ids.classroomInactive,
      name: 'AV-INACTIVE',
      maxCapacity: 25,
      roomTypeId: physicalRoomType.id,
      buildingId: building1.id,
      activeStatus: false,
    },
    {
      id: ids.classroom2Scope,
      name: 'AV-B201',
      maxCapacity: 18,
      roomTypeId: physicalRoomType.id,
      buildingId: building2.id,
      activeStatus: true,
    },
  ];
  for (const classroom of classroomData) {
    await prisma.classroom.upsert({
      where: { id: classroom.id },
      update: {
        name: classroom.name,
        desks: 30,
        tables: 15,
        powerOutlets: 10,
        lights: 8,
        blackboards: 1,
        lecterns: 1,
        windows: 4,
        buildingId: classroom.buildingId,
        roomTypeId: classroom.roomTypeId,
        projectors: 0,
        conditionId: condition.id,
        maxCapacity: classroom.maxCapacity,
        activeStatus: classroom.activeStatus,
      },
      create: {
        id: classroom.id,
        name: classroom.name,
        desks: 30,
        tables: 15,
        powerOutlets: 10,
        lights: 8,
        blackboards: 1,
        lecterns: 1,
        windows: 4,
        buildingId: classroom.buildingId,
        roomTypeId: classroom.roomTypeId,
        projectors: 0,
        conditionId: condition.id,
        maxCapacity: classroom.maxCapacity,
        activeStatus: classroom.activeStatus,
      },
    });
  }

  const classroomDepartments = [
    [ids.classroomDepartment1, ids.classroom1, department1.id],
    [ids.classroomDepartment2, ids.classroom2, department1.id],
    [ids.classroomDepartment3, ids.classroom3, department1.id],
    [ids.classroomDepartmentVirtual, ids.classroomVirtual, department1.id],
    [ids.classroomDepartmentInactive, ids.classroomInactive, department1.id],
    [ids.classroomDepartmentScope2, ids.classroom2Scope, department2.id],
  ] as const;
  for (const [id, classroomId, departmentId] of classroomDepartments) {
    await prisma.classroomDepartment.upsert({
      where: { id },
      update: { classroomId, departmentId },
      create: { id, classroomId, departmentId },
    });
  }

  await prisma.digitalBlackboard.upsert({
    where: { id: ids.board },
    update: {
      description: 'AV Pizarra principal',
      brandId: brand.id,
      monitorTypeId: monitorType.id,
      monitorSizeId: monitorSize.id,
      conditionId: condition.id,
      classroomId: ids.classroom1,
    },
    create: {
      id: ids.board,
      description: 'AV Pizarra principal',
      brandId: brand.id,
      monitorTypeId: monitorType.id,
      monitorSizeId: monitorSize.id,
      conditionId: condition.id,
      classroomId: ids.classroom1,
    },
  });
  for (const [id, inventoryNumber, classroomId] of [
    [ids.pc1, 'AV-PC-001', ids.classroom1],
    [ids.pc2, 'AV-PC-002', ids.classroom2],
  ] as const) {
    await prisma.pcEquipment.upsert({
      where: { id },
      update: {
        inventoryNumber,
        processor: 'AV Processor',
        ram: '16 GB',
        disk: '512 GB',
        brandId: brand.id,
        conditionId: condition.id,
        monitorTypeId: monitorType.id,
        monitorSizeId: monitorSize.id,
        pcTypeId: pcType.id,
        departmentId: department1.id,
        classroomId,
      },
      create: {
        id,
        inventoryNumber,
        processor: 'AV Processor',
        ram: '16 GB',
        disk: '512 GB',
        brandId: brand.id,
        conditionId: condition.id,
        monitorTypeId: monitorType.id,
        monitorSizeId: monitorSize.id,
        pcTypeId: pcType.id,
        departmentId: department1.id,
        classroomId,
      },
    });
  }
  await prisma.airConditioner.upsert({
    where: { id: ids.airConditioner },
    update: {
      description: 'AV Aire principal',
      brandId: brand.id,
      conditionId: condition.id,
      classroomId: ids.classroom1,
    },
    create: {
      id: ids.airConditioner,
      description: 'AV Aire principal',
      brandId: brand.id,
      conditionId: condition.id,
      classroomId: ids.classroom1,
    },
  });

  for (const [id, code, name, uvs] of [
    [ids.course1, 'AV-C101', 'AV Curso 101', 3],
    [ids.course2, 'AV-C202', 'AV Curso 202', 4],
    [ids.course3, 'AV-C303', 'AV Curso 303', 2],
  ] as const) {
    await prisma.course.upsert({
      where: { id },
      update: { code, name, uvs, departmentId: department1.id, activeStatus: true },
      create: { id, code, name, uvs, departmentId: department1.id, activeStatus: true },
    });
  }

  const permissions = [
    'analytics',
    'analytics-academic-load',
    'analytics-enrollment',
    'analytics-classrooms',
    'analytics-staff',
    'analytics-technology',
    'analytics-activities',
    'analytics-monitoring',
  ];
  const role = await prisma.role.upsert({
    where: { id: ids.role },
    update: { name: 'AV_ANALYTICS_READER', description: 'Validation reader', isSuperAdmin: false },
    create: { id: ids.role, name: 'AV_ANALYTICS_READER', description: 'Validation reader', isSuperAdmin: false },
  });
  for (const subject of permissions) {
    const permission = await prisma.permission.upsert({
      where: { action_subject: { action: 'read', subject } },
      update: {},
      create: { action: 'read', subject },
    });
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
      update: {},
      create: { roleId: role.id, permissionId: permission.id },
    });
  }

  const users = [
    [ids.userTeacher1, 'AV Docente Uno', 'av-teacher-1@example.invalid', 'AV-T1', true],
    [ids.userTeacher2, 'AV Docente Dos', 'av-teacher-2@example.invalid', 'AV-T2', true],
    [ids.userTeacher3, 'AV Docente Tres', 'av-teacher-3@example.invalid', 'AV-T3', true],
    [ids.userCoordinator1, 'AV Coordinador Uno', 'av-coordinator-1@example.invalid', 'AV-COORD-1', true],
    [ids.userCoordinator2, 'AV Coordinador Dos', 'av-coordinator-2@example.invalid', 'AV-COORD-2', true],
    [ids.userMonitor1, 'AV Monitor Uno', 'av-monitor-1@example.invalid', 'AV-MON-1', true],
    [ids.userMonitor2, 'AV Monitor Dos', 'av-monitor-2@example.invalid', 'AV-MON-2', true],
    [ids.userInactive, 'AV Usuario Inactivo', 'av-inactive@example.invalid', 'AV-INACTIVE', false],
  ] as const;
  for (const [id, name, email, code, activeStatus] of users) {
    const user = await prisma.user.upsert({
      where: { id },
      update: { name, email, code, hash: passwordHash, activeStatus },
      create: { id, name, email, code, hash: passwordHash, activeStatus },
    });
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: role.id } },
      update: {},
      create: { userId: user.id, roleId: role.id },
    });
  }

  const teacherCatalog = {
    categoryId: category.id,
    contractTypeId: contract.id,
    shiftId: shift.id,
  };
  for (const [id, userId] of [
    [ids.teacher1, ids.userTeacher1],
    [ids.teacher2, ids.userTeacher2],
    [ids.teacher3, ids.userTeacher3],
    [ids.teacherCoordinator1, ids.userCoordinator1],
    [ids.teacherCoordinator2, ids.userCoordinator2],
  ] as const) {
    await prisma.teacher.upsert({
      where: { id },
      update: { ...teacherCatalog, userId },
      create: { id, ...teacherCatalog, userId },
    });
  }
  for (const [id, teacherId, positionId, centerDepartmentId] of [
    ['b1000000-0000-4000-8000-000000000001', ids.teacher1, teacherPosition.id, centerDepartment1.id],
    ['b1000000-0000-4000-8000-000000000002', ids.teacher2, teacherPosition.id, centerDepartment1.id],
    ['b1000000-0000-4000-8000-000000000003', ids.teacher3, teacherPosition.id, centerDepartment1.id],
    ['b1000000-0000-4000-8000-000000000004', ids.teacherCoordinator1, headPosition.id, centerDepartment1.id],
    ['b1000000-0000-4000-8000-000000000005', ids.teacherCoordinator2, headPosition.id, centerDepartment2.id],
  ] as const) {
    await prisma.teacherDepartmentPosition.upsert({
      where: { id },
      update: { teacherId, positionId, centerDepartmentId, startDate: validFrom, endDate: validUntil },
      create: { id, teacherId, positionId, centerDepartmentId, startDate: validFrom, endDate: validUntil },
    });
  }

  for (const [id, teacherId, periodId] of [
    [ids.report1, ids.teacher1, period1.id],
    [ids.report2, ids.teacher2, period1.id],
    [ids.report3, ids.teacher1, period2.id],
  ] as const) {
    await prisma.academicAssignmentReport.upsert({
      where: { id },
      update: { teacherId, periodId, centerDepartmentId: centerDepartment1.id },
      create: { id, teacherId, periodId, centerDepartmentId: centerDepartment1.id },
    });
  }
  for (const [id, assignmentReportId] of [
    [ids.session1, ids.report1],
    [ids.session2, ids.report2],
    [ids.session3, ids.report3],
  ] as const) {
    await prisma.teachingSession.upsert({
      where: { id },
      update: { assignmentReportId },
      create: { id, assignmentReportId },
    });
  }

  const sections = [
    [ids.section1, ids.course1, ids.classroom1, ids.session1, 25, 'Presencial', 'Lu', '08:00 - 10:00', 'G1'],
    [ids.section2, ids.course2, ids.classroom1, ids.session2, 10, 'Presencial', 'Lu', '09:00 - 11:00', 'G2'],
    [ids.section3, ids.course3, ids.classroom2, ids.session2, 18, 'Presencial', 'Ma', '08:00 - 10:00', 'G3'],
    [ids.section4, ids.course1, ids.classroom3, ids.session2, null, 'Presencial', '??', 'invalid', 'G4'],
    [ids.section5, ids.course2, ids.classroomVirtual, ids.session1, 40, 'Espacio Virtual', 'Lu', '08:00 - 10:00', 'G5'],
    [ids.section6, ids.course1, ids.classroom1, ids.session3, 20, 'Presencial', 'Lu', '08:00 - 10:00', 'G6'],
    [ids.section7, ids.course2, ids.classroom2, ids.session3, 15, 'Presencial', 'Lu', '10:00 - 12:00', 'G7'],
  ] as const;
  for (const [id, courseId, classroomId, teachingSessionId, studentCount, modalityName, days, section, groupCode] of sections) {
    const modalityId = modalityName === 'Espacio Virtual' ? virtualModality.id : presentialModality.id;
    await prisma.courseClassroom.upsert({
      where: { id },
      update: {
        courseId,
        classroomId,
        studentCount,
        modalityId,
        nearGraduation: false,
        groupCode,
        teachingSessionId,
        days,
        section,
      },
      create: {
        id,
        courseId,
        classroomId,
        studentCount,
        modalityId,
        nearGraduation: false,
        groupCode,
        teachingSessionId,
        days,
        section,
      },
    });
  }

  const activityType1 = await prisma.activityType.upsert({
    where: { name: 'AV Docencia' },
    update: { description: 'AV activity type teaching' },
    create: { name: 'AV Docencia', description: 'AV activity type teaching' },
  });
  const activityType2 = await prisma.activityType.upsert({
    where: { name: 'AV Investigación' },
    update: { description: 'AV activity type research' },
    create: { name: 'AV Investigación', description: 'AV activity type research' },
  });
  for (const [id, name, assignmentReportId, activityTypeId, progressLevel, isRegistered] of [
    [ids.activity1, 'AV Activity One', ids.report1, activityType1.id, 'Completada', true],
    [ids.activity2, 'AV Activity Two', ids.report1, activityType2.id, 'En proceso', false],
    [ids.activity3, 'AV Activity Three', ids.report2, activityType1.id, 'Iniciada', null],
  ] as const) {
    await prisma.complementaryActivity.upsert({
      where: { id },
      update: { name, assignmentReportId, activityTypeId, progressLevel, isRegistered },
      create: { id, name, assignmentReportId, activityTypeId, progressLevel, isRegistered },
    });
  }

  for (const [monitorId, buildingId] of [
    [ids.userMonitor1, ids.building1],
    [ids.userMonitor2, ids.building2],
  ] as const) {
    await prisma.monitorBuildingAssignment.upsert({
      where: { monitorId_buildingId: { monitorId, buildingId } },
      update: {},
      create: { monitorId, buildingId },
    });
  }
  const checks = [
    [ids.check1, ids.section1, true, 'USED', '2026-08-04T06:00:00.000Z', '08:30'],
    [ids.check2, ids.section2, false, 'NOT_USED', '2026-08-05T06:00:00.000Z', '09:30'],
    [ids.check3, ids.section3, true, 'UNKNOWN', '2026-08-06T06:00:00.000Z', '08:30'],
    [ids.check4, ids.section4, true, null, '2026-08-07T06:00:00.000Z', '09:00'],
  ] as const;
  for (const [id, courseClassroomId, isPresent, digitalBlackboardUseStatus, checkDate, checkTime] of checks) {
    await prisma.scheduleComplianceCheck.upsert({
      where: { id },
      update: {
        courseClassroomId,
        monitorId: ids.userMonitor1,
        buildingId: building1.id,
        checkDate: new Date(checkDate),
        checkTime,
        isPresent,
        digitalBlackboardUseStatus,
        observation: `AV observation ${id}`,
      },
      create: {
        id,
        courseClassroomId,
        monitorId: ids.userMonitor1,
        buildingId: building1.id,
        checkDate: new Date(checkDate),
        checkTime,
        isPresent,
        digitalBlackboardUseStatus,
        observation: `AV observation ${id}`,
      },
    });
  }

  const counts = {
    periods: await prisma.academicPeriod.count({ where: { id: { in: [period1.id, period2.id, periodZero.id] } } }),
    classrooms: await prisma.classroom.count({ where: { id: { in: classroomData.map(({ id }) => id) } } }),
    sectionsP1: await prisma.courseClassroom.count({ where: { id: { in: [ids.section1, ids.section2, ids.section3, ids.section4, ids.section5] } } }),
    sectionsP2: await prisma.courseClassroom.count({ where: { id: { in: [ids.section6, ids.section7] } } }),
    activities: await prisma.complementaryActivity.count({ where: { id: { in: [ids.activity1, ids.activity2, ids.activity3] } } }),
    checks: await prisma.scheduleComplianceCheck.count({ where: { id: { in: [ids.check1, ids.check2, ids.check3, ids.check4] } } }),
  };
  const manifest = {
    fixture: 'analytics-validation',
    version: 1,
    generatedAt: new Date().toISOString(),
    passwordPolicy: 'Generated fixture users share ANALYTICS_FIXTURE_PASSWORD; value is intentionally not stored.',
    ids: {
      center: center.id,
      centerDepartment1: centerDepartment1.id,
      centerDepartment2: centerDepartment2.id,
      building1: building1.id,
      building2: building2.id,
      period1: period1.id,
      period2: period2.id,
      periodZero: periodZero.id,
      sectionsP1: [ids.section1, ids.section2, ids.section3, ids.section4, ids.section5],
      sectionsP2: [ids.section6, ids.section7],
      users: {
        teacher1: ids.userTeacher1,
        teacher2: ids.userTeacher2,
        teacher3: ids.userTeacher3,
        coordinator1: ids.userCoordinator1,
        coordinator2: ids.userCoordinator2,
        monitor1: ids.userMonitor1,
        monitor2: ids.userMonitor2,
        inactive: ids.userInactive,
      },
    },
    counts,
    expectedP1: {
      academicLoad: {
        offeredSections: 5,
        distinctCourses: 3,
        assignedUvs: 16,
        assignedTeachers: 2,
        averageSectionsPerTeacher: 2.5,
        averageUvsPerTeacher: 8,
      },
      enrollment: {
        reportedEnrollments: 93,
        averageEnrollmentPerSection: 23.25,
        sectionsOverCapacity: 0,
        availablePhysicalSeats: 27,
        occupancyRate: 66.25,
        enrollmentDataCoverage: 80,
      },
      classroomAvailability: {
        eligibleClassrooms: 3,
        occupiedClassrooms: 1,
        availableClassrooms: 1,
        indeterminateClassrooms: 1,
      },
      classroomCapacity: { installedCapacity: 50, capacityDataCoverage: 66.6666666667 },
      technology: {
        eligibleClassrooms: 3,
        equippedClassrooms: 1,
        digitalBlackboardCoverage: 33.3333333333,
        knownEnrollmentsInEquippedClassrooms: 35,
        equippedEnrollmentDataCoverage: 100,
        totalEquipment: 4,
      },
      activities: {
        totalActivities: 3,
        reportedTeachers: 2,
        averageActivitiesPerReportedTeacher: 1.5,
      },
      monitoring: {
        totalChecks: 4,
        presentChecks: 3,
        absentChecks: 1,
        complianceRate: 75,
        observedBlackboardUseRate: 50,
        blackboardObservationCoverage: 66.6666666667,
      },
    },
  };
  const manifestPath = process.env.ANALYTICS_FIXTURE_MANIFEST;
  if (manifestPath) {
    mkdirSync(dirname(manifestPath), { recursive: true });
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  }
  console.log(JSON.stringify(manifest, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
