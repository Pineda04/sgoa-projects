import 'dotenv/config';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import * as argon from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import {
	DigitalBlackboardUseStatus,
	PrismaClient,
} from 'src/generated/prisma/client';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required.');

const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString: databaseUrl }),
});

const demoPassword = process.env.ANALYTICS_DEMO_PASSWORD ?? 'Demo12345!';

const ids = {
	center: 'b2000000-0000-4000-8000-000000000003',
	department1: 'b2000000-0000-4000-8000-000000000004',
	department2: 'b2000000-0000-4000-8000-000000000005',
	centerDepartment1: 'b2000000-0000-4000-8000-000000000006',
	centerDepartment2: 'b2000000-0000-4000-8000-000000000007',
	building1: 'b2000000-0000-4000-8000-000000000008',
	building2: 'b2000000-0000-4000-8000-000000000009',
	period1: 'b2000000-0000-4000-8000-000000000001',
	period2: 'b2000000-0000-4000-8000-000000000002',
	course1: 'b2000000-0000-4000-8000-000000000010',
	course2: 'b2000000-0000-4000-8000-000000000011',
	course3: 'b2000000-0000-4000-8000-000000000012',
	course4: 'b2000000-0000-4000-8000-000000000013',
	course5: 'b2000000-0000-4000-8000-000000000014',
	room1: 'b2000000-0000-4000-8000-000000000020',
	room2: 'b2000000-0000-4000-8000-000000000021',
	room3: 'b2000000-0000-4000-8000-000000000022',
	room4: 'b2000000-0000-4000-8000-000000000023',
	roomVirtual: 'b2000000-0000-4000-8000-000000000024',
	roomDepartment1: 'b2000000-0000-4000-8000-000000000030',
	roomDepartment2: 'b2000000-0000-4000-8000-000000000031',
	roomDepartment3: 'b2000000-0000-4000-8000-000000000032',
	roomDepartment4: 'b2000000-0000-4000-8000-000000000033',
	roomDepartmentVirtual: 'b2000000-0000-4000-8000-000000000034',
	roomDepartment3Primary: 'b2000000-0000-4000-8000-000000000035',
	blackboard1: 'b2000000-0000-4000-8000-000000000040',
	blackboard2: 'b2000000-0000-4000-8000-000000000041',
	pc1: 'b2000000-0000-4000-8000-000000000042',
	pc2: 'b2000000-0000-4000-8000-000000000043',
	air1: 'b2000000-0000-4000-8000-000000000044',
	contract: 'b2000000-0000-4000-8000-000000000050',
	category: 'b2000000-0000-4000-8000-000000000051',
	shift: 'b2000000-0000-4000-8000-000000000052',
	user1: 'b2000000-0000-4000-8000-000000000060',
	user2: 'b2000000-0000-4000-8000-000000000061',
	user3: 'b2000000-0000-4000-8000-000000000062',
	teacher1: 'b2000000-0000-4000-8000-000000000070',
	teacher2: 'b2000000-0000-4000-8000-000000000071',
	teacher3: 'b2000000-0000-4000-8000-000000000072',
	appointment1: 'b2000000-0000-4000-8000-000000000080',
	appointment2: 'b2000000-0000-4000-8000-000000000081',
	appointment3: 'b2000000-0000-4000-8000-000000000082',
	report1: 'b2000000-0000-4000-8000-000000000090',
	report2: 'b2000000-0000-4000-8000-000000000091',
	report3: 'b2000000-0000-4000-8000-000000000092',
	report4: 'b2000000-0000-4000-8000-000000000093',
	report5: 'b2000000-0000-4000-8000-000000000094',
	session1: 'b2000000-0000-4000-8000-000000000100',
	session2: 'b2000000-0000-4000-8000-000000000101',
	session3: 'b2000000-0000-4000-8000-000000000102',
	session4: 'b2000000-0000-4000-8000-000000000103',
	session5: 'b2000000-0000-4000-8000-000000000104',
	section1: 'b2000000-0000-4000-8000-000000000110',
	section2: 'b2000000-0000-4000-8000-000000000111',
	section3: 'b2000000-0000-4000-8000-000000000112',
	section4: 'b2000000-0000-4000-8000-000000000113',
	section5: 'b2000000-0000-4000-8000-000000000114',
	section6: 'b2000000-0000-4000-8000-000000000115',
	section7: 'b2000000-0000-4000-8000-000000000116',
	section8: 'b2000000-0000-4000-8000-000000000117',
	statistic1: 'b2000000-0000-4000-8000-000000000120',
	statistic2: 'b2000000-0000-4000-8000-000000000121',
	statistic3: 'b2000000-0000-4000-8000-000000000122',
	statistic4: 'b2000000-0000-4000-8000-000000000123',
	activity1: 'b2000000-0000-4000-8000-000000000150',
	activity2: 'b2000000-0000-4000-8000-000000000151',
	activity3: 'b2000000-0000-4000-8000-000000000152',
	activity4: 'b2000000-0000-4000-8000-000000000153',
	activity5: 'b2000000-0000-4000-8000-000000000154',
	activity6: 'b2000000-0000-4000-8000-000000000155',
	activity7: 'b2000000-0000-4000-8000-000000000156',
	activity8: 'b2000000-0000-4000-8000-000000000157',
	media1: 'b2000000-0000-4000-8000-000000000170',
	media2: 'b2000000-0000-4000-8000-000000000171',
	media3: 'b2000000-0000-4000-8000-000000000172',
	check1: 'b2000000-0000-4000-8000-000000000180',
	check2: 'b2000000-0000-4000-8000-000000000181',
	check3: 'b2000000-0000-4000-8000-000000000182',
	check4: 'b2000000-0000-4000-8000-000000000183',
	check5: 'b2000000-0000-4000-8000-000000000184',
	check6: 'b2000000-0000-4000-8000-000000000185',
	activityType1: 'b2000000-0000-4000-8000-000000000130',
	activityType2: 'b2000000-0000-4000-8000-000000000131',
	activityType3: 'b2000000-0000-4000-8000-000000000132',
	activityType4: 'b2000000-0000-4000-8000-000000000133',
	activityType5: 'b2000000-0000-4000-8000-000000000134',
	activityType6: 'b2000000-0000-4000-8000-000000000135',
	activityType7: 'b2000000-0000-4000-8000-000000000136',
} as const;

const requireValue = <T>(value: T | null, label: string): T => {
	if (!value) throw new Error(`Missing base fixture value: ${label}`);
	return value;
};

async function main() {
	const faculty = requireValue(
		await prisma.faculty.findFirst({ orderBy: { name: 'asc' } }),
		'faculty'
	);
	const demoCenter = await prisma.center.upsert({
		where: { id: ids.center },
		update: { name: 'Demo Centro de Analiticas' },
		create: { id: ids.center, name: 'Demo Centro de Analiticas' },
	});
	const demoDepartment1 = await prisma.department.upsert({
		where: { id: ids.department1 },
		update: { name: 'Demo Departamento Principal', facultyId: faculty.id },
		create: { id: ids.department1, name: 'Demo Departamento Principal', facultyId: faculty.id },
	});
	const demoDepartment2 = await prisma.department.upsert({
		where: { id: ids.department2 },
		update: { name: 'Demo Departamento Secundario', facultyId: faculty.id },
		create: { id: ids.department2, name: 'Demo Departamento Secundario', facultyId: faculty.id },
	});
	const demoCenterDepartment1 = await prisma.centerDepartment.upsert({
		where: { id: ids.centerDepartment1 },
		update: { centerId: demoCenter.id, departmentId: demoDepartment1.id },
		create: { id: ids.centerDepartment1, centerId: demoCenter.id, departmentId: demoDepartment1.id },
	});
	const demoCenterDepartment2 = await prisma.centerDepartment.upsert({
		where: { id: ids.centerDepartment2 },
		update: { centerId: demoCenter.id, departmentId: demoDepartment2.id },
		create: { id: ids.centerDepartment2, centerId: demoCenter.id, departmentId: demoDepartment2.id },
	});
	const demoBuilding1 = await prisma.building.upsert({
		where: { id: ids.building1 },
		update: { name: 'Demo Edificio Principal', centerId: demoCenter.id },
		create: { id: ids.building1, name: 'Demo Edificio Principal', centerId: demoCenter.id },
	});
	const demoBuilding2 = await prisma.building.upsert({
		where: { id: ids.building2 },
		update: { name: 'Demo Edificio Secundario', centerId: demoCenter.id },
		create: { id: ids.building2, name: 'Demo Edificio Secundario', centerId: demoCenter.id },
	});
	const physicalRoomType = requireValue(
		await prisma.roomType.findFirst({ where: { description: 'Aula' } }),
		'physical room type'
	);
	const virtualRoomType = requireValue(
		await prisma.roomType.findFirst({
			where: { description: 'Espacio Virtual' },
		}),
		'virtual room type'
	);
	const presentialModality = requireValue(
		await prisma.modality.findUnique({ where: { name: 'Presencial' } }),
		'presential modality'
	);
	const virtualModality = requireValue(
		await prisma.modality.findUnique({ where: { name: 'Espacio Virtual' } }),
		'virtual modality'
	);
	const brand = requireValue(
		await prisma.brand.findFirst({ orderBy: { name: 'asc' } }),
		'brand'
	);
	const condition = requireValue(
		await prisma.condition.findFirst({ orderBy: { status: 'asc' } }),
		'condition'
	);
	const monitorType = requireValue(
		await prisma.monitorType.findFirst({ orderBy: { description: 'asc' } }),
		'monitor type'
	);
	const monitorSize = requireValue(
		await prisma.monitorSize.findFirst({ orderBy: { description: 'asc' } }),
		'monitor size'
	);
	const pcType = requireValue(
		await prisma.pcType.findFirst({ orderBy: { description: 'asc' } }),
		'pc type'
	);
	const category = requireValue(
		await prisma.teacherCategory.findFirst({ orderBy: { name: 'asc' } }),
		'teacher category'
	);
	const contract = requireValue(
		await prisma.contractType.findFirst({ orderBy: { name: 'asc' } }),
		'contract type'
	);
	const shift = requireValue(
		await prisma.shift.findFirst({ orderBy: { name: 'asc' } }),
		'shift'
	);
	const nonePosition = requireValue(
		await prisma.position.findUnique({ where: { name: 'Docente' } }),
		'Docente position'
	);
	const coordinatorPosition = requireValue(
		await prisma.position.findUnique({
			where: { name: 'Coordinador Académico de grado' },
		}),
		'coordinator position'
	);
	const headPosition = requireValue(
		await prisma.position.findUnique({ where: { name: 'Jefe de Departamento' } }),
		'head position'
	);
	const validationRole = requireValue(
		await prisma.role.findUnique({ where: { name: 'AV_ANALYTICS_READER' } }),
		'validation role'
	);
	const monitor1 = requireValue(
		await prisma.user.findUnique({
			where: { id: 'a1000000-0000-4000-8000-000000000031' },
		}),
		'monitor1'
	);
	const monitor2 = requireValue(
		await prisma.user.findUnique({
			where: { id: 'a1000000-0000-4000-8000-000000000032' },
		}),
		'monitor2'
	);

	const demoCondition = await prisma.condition.upsert({
		where: { id: 'b2000000-0000-4000-8000-000000000003' },
		update: { status: 'Regular' },
		create: { id: 'b2000000-0000-4000-8000-000000000003', status: 'Regular' },
	});
	const demoCategory = await prisma.teacherCategory.upsert({
		where: { id: ids.category },
		update: { name: 'Demo Profesor Asociado', description: 'Catalogo demo' },
		create: {
			id: ids.category,
			name: 'Demo Profesor Asociado',
			description: 'Catalogo demo',
		},
	});
	const demoContract = await prisma.contractType.upsert({
		where: { id: ids.contract },
		update: { name: 'Demo Contrato Temporal' },
		create: { id: ids.contract, name: 'Demo Contrato Temporal' },
	});
	const demoShift = await prisma.shift.upsert({
		where: { id: ids.shift },
		update: { name: 'Demo Jornada Completa' },
		create: { id: ids.shift, name: 'Demo Jornada Completa' },
	});

	await prisma.academicPeriod.upsert({
		where: { id: ids.period1 },
		update: {
			year: 2093,
			pac: 1,
			pac_modality: 'Trimestre',
			startDate: new Date('2093-01-01T06:00:00.000Z'),
			endDate: new Date('2093-04-30T06:00:00.000Z'),
		},
		create: {
			id: ids.period1,
			year: 2093,
			pac: 1,
			pac_modality: 'Trimestre',
			startDate: new Date('2093-01-01T06:00:00.000Z'),
			endDate: new Date('2093-04-30T06:00:00.000Z'),
		},
	});
	await prisma.academicPeriod.upsert({
		where: { id: ids.period2 },
		update: {
			year: 2093,
			pac: 2,
			pac_modality: 'Trimestre',
			startDate: new Date('2093-05-01T06:00:00.000Z'),
			endDate: new Date('2093-08-31T06:00:00.000Z'),
		},
		create: {
			id: ids.period2,
			year: 2093,
			pac: 2,
			pac_modality: 'Trimestre',
			startDate: new Date('2093-05-01T06:00:00.000Z'),
			endDate: new Date('2093-08-31T06:00:00.000Z'),
		},
	});

	for (const course of [
		{ id: ids.course1, code: 'DEMO-101', name: 'Demo Fundamentos', uvs: 3 },
		{ id: ids.course2, code: 'DEMO-202', name: 'Demo Investigacion', uvs: 4 },
		{ id: ids.course3, code: 'DEMO-303', name: 'Demo Gestion', uvs: 5 },
		{ id: ids.course4, code: 'DEMO-404', name: 'Demo Datos Faltantes', uvs: 2 },
		{ id: ids.course5, code: 'DEMO-505', name: 'Demo Modalidad Virtual', uvs: 4 },
	]) {
		await prisma.course.upsert({
			where: { id: course.id },
			update: { ...course, departmentId: demoDepartment1.id, activeStatus: true },
			create: { ...course, departmentId: demoDepartment1.id, activeStatus: true },
		});
	}

	const rooms = [
		{ id: ids.room1, name: 'DEMO-AULA-ALTA', maxCapacity: 30, roomTypeId: physicalRoomType.id, buildingId: demoBuilding1.id },
		{ id: ids.room2, name: 'DEMO-AULA-CAPACIDAD', maxCapacity: 60, roomTypeId: physicalRoomType.id, buildingId: demoBuilding1.id },
		{ id: ids.room3, name: 'DEMO-AULA-B2', maxCapacity: 18, roomTypeId: physicalRoomType.id, buildingId: demoBuilding2.id },
		{ id: ids.room4, name: 'DEMO-AULA-SIN-CAPACIDAD', maxCapacity: null, roomTypeId: physicalRoomType.id, buildingId: demoBuilding1.id },
		{ id: ids.roomVirtual, name: 'DEMO-VIRTUAL', maxCapacity: null, roomTypeId: virtualRoomType.id, buildingId: demoBuilding1.id },
	];
	for (const room of rooms) {
		await prisma.classroom.upsert({
			where: { id: room.id },
			update: {
				...room,
				desks: 40,
				tables: 20,
				powerOutlets: 12,
				lights: 10,
				blackboards: 1,
				lecterns: 1,
				windows: 5,
				projectors: 1,
				conditionId: condition.id,
				activeStatus: true,
			},
			create: {
				...room,
				desks: 40,
				tables: 20,
				powerOutlets: 12,
				lights: 10,
				blackboards: 1,
				lecterns: 1,
				windows: 5,
				projectors: 1,
				conditionId: condition.id,
				activeStatus: true,
			},
		});
	}
	for (const relation of [
		{ id: ids.roomDepartment1, classroomId: ids.room1, departmentId: demoDepartment1.id },
		{ id: ids.roomDepartment2, classroomId: ids.room2, departmentId: demoDepartment1.id },
		{ id: ids.roomDepartment3, classroomId: ids.room3, departmentId: demoDepartment2.id },
		{ id: ids.roomDepartment3Primary, classroomId: ids.room3, departmentId: demoDepartment1.id },
		{ id: ids.roomDepartment4, classroomId: ids.room4, departmentId: demoDepartment1.id },
		{ id: ids.roomDepartmentVirtual, classroomId: ids.roomVirtual, departmentId: demoDepartment1.id },
	]) {
		await prisma.classroomDepartment.upsert({
			where: { id: relation.id },
			update: relation,
			create: relation,
		});
	}

	await prisma.digitalBlackboard.upsert({
		where: { id: ids.blackboard1 },
		update: { description: 'Demo Pizarra A', brandId: brand.id, monitorTypeId: monitorType.id, monitorSizeId: monitorSize.id, conditionId: condition.id, classroomId: ids.room1 },
		create: { id: ids.blackboard1, description: 'Demo Pizarra A', brandId: brand.id, monitorTypeId: monitorType.id, monitorSizeId: monitorSize.id, conditionId: condition.id, classroomId: ids.room1 },
	});
	await prisma.digitalBlackboard.upsert({
		where: { id: ids.blackboard2 },
		update: { description: 'Demo Pizarra B', brandId: brand.id, monitorTypeId: monitorType.id, monitorSizeId: monitorSize.id, conditionId: demoCondition.id, classroomId: ids.room3 },
		create: { id: ids.blackboard2, description: 'Demo Pizarra B', brandId: brand.id, monitorTypeId: monitorType.id, monitorSizeId: monitorSize.id, conditionId: demoCondition.id, classroomId: ids.room3 },
	});
	for (const pc of [
		{ id: ids.pc1, inventoryNumber: 'DEMO-PC-001', classroomId: ids.room2, conditionId: condition.id },
		{ id: ids.pc2, inventoryNumber: 'DEMO-PC-002', classroomId: ids.room3, conditionId: demoCondition.id },
	]) {
		await prisma.pcEquipment.upsert({
			where: { id: pc.id },
			update: { ...pc, processor: 'Demo CPU', ram: '16 GB', disk: '512 GB', brandId: brand.id, monitorTypeId: monitorType.id, monitorSizeId: monitorSize.id, pcTypeId: pcType.id, departmentId: demoDepartment1.id },
			create: { ...pc, processor: 'Demo CPU', ram: '16 GB', disk: '512 GB', brandId: brand.id, monitorTypeId: monitorType.id, monitorSizeId: monitorSize.id, pcTypeId: pcType.id, departmentId: demoDepartment1.id },
		});
	}
	await prisma.airConditioner.upsert({
		where: { id: ids.air1 },
		update: { description: 'Demo Aire', brandId: brand.id, conditionId: demoCondition.id, classroomId: ids.room1 },
		create: { id: ids.air1, description: 'Demo Aire', brandId: brand.id, conditionId: demoCondition.id, classroomId: ids.room1 },
	});

	const passwordHash = await argon.hash(demoPassword);
	const users = [
		{ id: ids.user1, name: 'Demo Docente Uno', email: 'demo-teacher-1@example.invalid', code: 'DEMO-T1' },
		{ id: ids.user2, name: 'Demo Docente Dos', email: 'demo-teacher-2@example.invalid', code: 'DEMO-T2' },
		{ id: ids.user3, name: 'Demo Docente Tres', email: 'demo-teacher-3@example.invalid', code: 'DEMO-T3' },
	];
	for (const user of users) {
		await prisma.user.upsert({
			where: { id: user.id },
			update: { ...user, hash: passwordHash, activeStatus: true },
			create: { ...user, hash: passwordHash, activeStatus: true },
		});
		await prisma.userRole.upsert({
			where: { userId_roleId: { userId: user.id, roleId: validationRole.id } },
			update: {},
			create: { userId: user.id, roleId: validationRole.id },
		});
	}
	for (const teacher of [
		{ id: ids.teacher1, userId: ids.user1, categoryId: category.id, contractTypeId: contract.id, shiftId: shift.id },
		{ id: ids.teacher2, userId: ids.user2, categoryId: demoCategory.id, contractTypeId: demoContract.id, shiftId: demoShift.id },
		{ id: ids.teacher3, userId: ids.user3, categoryId: category.id, contractTypeId: demoContract.id, shiftId: shift.id },
	]) {
		await prisma.teacher.upsert({
			where: { id: teacher.id },
			update: teacher,
			create: teacher,
		});
	}
	for (const appointment of [
		{ id: ids.appointment1, teacherId: ids.teacher1, positionId: nonePosition.id, centerDepartmentId: demoCenterDepartment1.id },
		{ id: ids.appointment2, teacherId: ids.teacher2, positionId: coordinatorPosition.id, centerDepartmentId: demoCenterDepartment1.id },
		{ id: ids.appointment3, teacherId: ids.teacher3, positionId: headPosition.id, centerDepartmentId: demoCenterDepartment2.id },
	]) {
		await prisma.teacherDepartmentPosition.upsert({
			where: { id: appointment.id },
			update: { ...appointment, startDate: new Date('2026-01-01T00:00:00.000Z'), endDate: new Date('2027-12-31T23:59:59.000Z') },
			create: { ...appointment, startDate: new Date('2026-01-01T00:00:00.000Z'), endDate: new Date('2027-12-31T23:59:59.000Z') },
		});
	}

	for (const report of [
		{ id: ids.report1, teacherId: ids.teacher1, periodId: ids.period1, centerDepartmentId: demoCenterDepartment1.id },
		{ id: ids.report2, teacherId: ids.teacher2, periodId: ids.period1, centerDepartmentId: demoCenterDepartment1.id },
		{ id: ids.report3, teacherId: ids.teacher3, periodId: ids.period1, centerDepartmentId: demoCenterDepartment2.id },
		{ id: ids.report4, teacherId: ids.teacher1, periodId: ids.period2, centerDepartmentId: demoCenterDepartment1.id },
		{ id: ids.report5, teacherId: ids.teacher2, periodId: ids.period2, centerDepartmentId: demoCenterDepartment1.id },
	]) {
		await prisma.academicAssignmentReport.upsert({
			where: { id: report.id },
			update: report,
			create: report,
		});
	}
	for (const session of [
		{ id: ids.session1, assignmentReportId: ids.report1 },
		{ id: ids.session2, assignmentReportId: ids.report2 },
		{ id: ids.session3, assignmentReportId: ids.report3 },
		{ id: ids.session4, assignmentReportId: ids.report4 },
		{ id: ids.session5, assignmentReportId: ids.report5 },
	]) {
		await prisma.teachingSession.upsert({
			where: { id: session.id },
			update: { ...session, consultHour: new Date('2093-01-10T14:00:00.000Z'), tutoringHour: new Date('2093-01-10T15:00:00.000Z') },
			create: { ...session, consultHour: new Date('2093-01-10T14:00:00.000Z'), tutoringHour: new Date('2093-01-10T15:00:00.000Z') },
		});
	}

	const sectionRows = [
		{ id: ids.section1, courseId: ids.course1, classroomId: ids.room1, teachingSessionId: ids.session1, studentCount: 45, modalityId: presentialModality.id, groupCode: 'DEMO-A', days: 'Lu', section: '08:00 - 10:00' },
		{ id: ids.section2, courseId: ids.course2, classroomId: ids.roomVirtual, teachingSessionId: ids.session1, studentCount: 35, modalityId: virtualModality.id, groupCode: 'DEMO-V', days: 'Mi', section: '10:00 - 12:00' },
		{ id: ids.section3, courseId: ids.course3, classroomId: ids.room2, teachingSessionId: ids.session2, studentCount: 0, modalityId: presentialModality.id, groupCode: 'DEMO-B', days: 'Ma', section: '10:00 - 12:00' },
		{ id: ids.section4, courseId: ids.course4, classroomId: ids.room4, teachingSessionId: ids.session2, studentCount: null, modalityId: presentialModality.id, groupCode: 'DEMO-MISSING', days: '??', section: 'invalid' },
		{ id: ids.section5, courseId: ids.course5, classroomId: ids.room2, teachingSessionId: ids.session2, studentCount: 60, modalityId: presentialModality.id, groupCode: 'DEMO-CAP', days: 'Ju', section: '14:00 - 16:00' },
		{ id: ids.section6, courseId: ids.course1, classroomId: ids.room3, teachingSessionId: ids.session3, studentCount: 12, modalityId: presentialModality.id, groupCode: 'DEMO-B2', days: 'Vi', section: '08:00 - 10:00' },
		{ id: ids.section7, courseId: ids.course3, classroomId: ids.room1, teachingSessionId: ids.session4, studentCount: 20, modalityId: presentialModality.id, groupCode: 'DEMO-P2A', days: 'Lu', section: '08:00 - 10:00' },
		{ id: ids.section8, courseId: ids.course4, classroomId: ids.room2, teachingSessionId: ids.session5, studentCount: 55, modalityId: presentialModality.id, groupCode: 'DEMO-P2B', days: 'Ma', section: '14:00 - 16:00' },
	];
	for (const section of sectionRows) {
		await prisma.courseClassroom.upsert({
			where: { id: section.id },
			update: { ...section, nearGraduation: false },
			create: { ...section, nearGraduation: false },
		});
	}
	for (const statistic of [
		{ id: ids.statistic1, courseClassroomId: ids.section1, APB: 20, RPB: 10, NSP: 5, ABD: 10 },
		{ id: ids.statistic2, courseClassroomId: ids.section3, APB: 0, RPB: 0, NSP: 0, ABD: 0 },
		{ id: ids.statistic3, courseClassroomId: ids.section5, APB: 30, RPB: 20, NSP: 5, ABD: 5 },
		{ id: ids.statistic4, courseClassroomId: ids.section6, APB: 8, RPB: 2, NSP: 1, ABD: 1 },
	]) {
		await prisma.courseStadistic.upsert({
			where: { id: statistic.id },
			update: statistic,
			create: statistic,
		});
	}

	const activityTypeNames = [
		'Demo Docencia',
		'Demo Investigacion',
		'Demo Vinculacion',
		'Demo Innovacion',
		'Demo Curriculum',
		'Demo Gestion',
		'Demo Otras',
	];
	const activityTypeIds = [
		ids.activityType1,
		ids.activityType2,
		ids.activityType3,
		ids.activityType4,
		ids.activityType5,
		ids.activityType6,
		ids.activityType7,
	];
	const activityTypes: { id: string }[] = [];
	for (let index = 0; index < activityTypeNames.length; index += 1) {
		activityTypes.push(
			await prisma.activityType.upsert({
				where: { id: activityTypeIds[index] },
				update: { name: activityTypeNames[index], description: 'Tipo de actividad demo' },
				create: { id: activityTypeIds[index], name: activityTypeNames[index], description: 'Tipo de actividad demo' },
			})
		);
	}
	for (const [index, activity] of ([
		{ id: ids.activity1, name: 'Demo actividad docencia', reportId: ids.report1, registered: true, progress: 'Completada' },
		{ id: ids.activity2, name: 'Demo actividad investigacion', reportId: ids.report1, registered: false, progress: 'En proceso' },
		{ id: ids.activity3, name: 'Demo actividad vinculacion', reportId: ids.report1, registered: null, progress: 'Iniciada' },
		{ id: ids.activity4, name: 'Demo actividad innovacion', reportId: ids.report2, registered: true, progress: 'Completada' },
		{ id: ids.activity5, name: 'Demo actividad curriculum', reportId: ids.report2, registered: false, progress: 'En proceso' },
		{ id: ids.activity6, name: 'Demo actividad gestion', reportId: ids.report2, registered: true, progress: 'Completada' },
		{ id: ids.activity7, name: 'Demo actividad otras', reportId: ids.report2, registered: null, progress: 'Iniciada' },
		{ id: ids.activity8, name: 'Demo actividad periodo dos', reportId: ids.report4, registered: true, progress: 'Completada' },
	] as const).entries()) {
		await prisma.complementaryActivity.upsert({
			where: { id: activity.id },
			update: { name: activity.name, assignmentReportId: activity.reportId, activityTypeId: activityTypes[index % activityTypes.length].id, isRegistered: activity.registered, progressLevel: activity.progress, fileNumber: activity.registered ? `DEMO-${index + 1}` : null },
			create: { id: activity.id, name: activity.name, assignmentReportId: activity.reportId, activityTypeId: activityTypes[index % activityTypes.length].id, isRegistered: activity.registered, progressLevel: activity.progress, fileNumber: activity.registered ? `DEMO-${index + 1}` : null },
		});
	}
	for (const media of [
		{ id: ids.media1, activityId: ids.activity1, description: 'Evidencia demo de docencia' },
		{ id: ids.media2, activityId: ids.activity2, description: 'Evidencia demo de investigacion' },
		{ id: ids.media3, activityId: ids.activity3, description: 'Evidencia demo de vinculacion' },
	]) {
		await prisma.verificationMedia.upsert({
			where: { id: media.id },
			update: media,
			create: media,
		});
	}

	for (const assignment of [
		{ monitorId: monitor1.id, buildingId: demoBuilding1.id },
		{ monitorId: monitor2.id, buildingId: demoBuilding2.id },
	]) {
		await prisma.monitorBuildingAssignment.upsert({
			where: { monitorId_buildingId: assignment },
			update: {},
			create: assignment,
		});
	}
	for (const check of [
		{ id: ids.check1, courseClassroomId: ids.section1, monitorId: monitor1.id, buildingId: demoBuilding1.id, checkDate: '2093-01-10T06:00:00.000Z', checkTime: '08:00', isPresent: true, status: DigitalBlackboardUseStatus.USED },
		{ id: ids.check2, courseClassroomId: ids.section3, monitorId: monitor1.id, buildingId: demoBuilding1.id, checkDate: '2093-01-11T06:00:00.000Z', checkTime: '10:00', isPresent: false, status: DigitalBlackboardUseStatus.NOT_USED },
		{ id: ids.check3, courseClassroomId: ids.section6, monitorId: monitor2.id, buildingId: demoBuilding2.id, checkDate: '2093-01-12T06:00:00.000Z', checkTime: '08:00', isPresent: true, status: DigitalBlackboardUseStatus.UNKNOWN },
		{ id: ids.check4, courseClassroomId: ids.section4, monitorId: monitor1.id, buildingId: demoBuilding1.id, checkDate: '2093-01-13T06:00:00.000Z', checkTime: '09:00', isPresent: false, status: null },
		{ id: ids.check5, courseClassroomId: ids.section7, monitorId: monitor1.id, buildingId: demoBuilding1.id, checkDate: '2093-05-10T06:00:00.000Z', checkTime: '08:00', isPresent: true, status: DigitalBlackboardUseStatus.USED },
		{ id: ids.check6, courseClassroomId: ids.section5, monitorId: monitor1.id, buildingId: demoBuilding1.id, checkDate: '2093-01-14T06:00:00.000Z', checkTime: '14:00', isPresent: true, status: DigitalBlackboardUseStatus.UNKNOWN },
	]) {
		await prisma.scheduleComplianceCheck.upsert({
			where: { id: check.id },
			update: {
				courseClassroomId: check.courseClassroomId,
				monitorId: check.monitorId,
				buildingId: check.buildingId,
				checkDate: new Date(check.checkDate),
				checkTime: check.checkTime,
				isPresent: check.isPresent,
				digitalBlackboardUseStatus: check.status,
				observation: 'Observacion demo',
			},
			create: {
				id: check.id,
				courseClassroomId: check.courseClassroomId,
				monitorId: check.monitorId,
				buildingId: check.buildingId,
				checkDate: new Date(check.checkDate),
				checkTime: check.checkTime,
				isPresent: check.isPresent,
				digitalBlackboardUseStatus: check.status,
				observation: 'Observacion demo',
			},
		});
	}

	const manifest = {
		fixture: 'analytics-demo',
		version: 1,
		periods: { current: ids.period1, comparison: ids.period2 },
		centerDepartments: {
			primary: demoCenterDepartment1.id,
			secondary: demoCenterDepartment2.id,
		},
		buildings: { primary: demoBuilding1.id, secondary: demoBuilding2.id },
		counts: {
			courses: await prisma.course.count({ where: { id: { in: Object.values(ids).filter(id => id.includes('00000000001')) } } }),
			sections: await prisma.courseClassroom.count({ where: { id: { in: sectionRows.map(({ id }) => id) } } }),
			activities: await prisma.complementaryActivity.count({ where: { id: { in: [ids.activity1, ids.activity2, ids.activity3, ids.activity4, ids.activity5, ids.activity6, ids.activity7, ids.activity8] } } }),
			checks: await prisma.scheduleComplianceCheck.count({ where: { id: { in: [ids.check1, ids.check2, ids.check3, ids.check4, ids.check5, ids.check6] } } }),
		},
	};
	const manifestPath = process.env.ANALYTICS_DEMO_MANIFEST;
	if (manifestPath) {
		mkdirSync(dirname(manifestPath), { recursive: true });
		writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
	}
	console.log(JSON.stringify(manifest, null, 2));
}

main()
	.catch(error => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(async () => prisma.$disconnect());
