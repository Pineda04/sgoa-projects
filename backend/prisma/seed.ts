import 'dotenv/config';
import { PrismaClient } from 'src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as argon from 'argon2';
import {
  academicPeriodsSeed,
  activityTypesSeed,
  brandsSeed,
  careersSeed,
  categoriesSeed,
  centerDepartmentsSeed,
  centersSeed,
  conditionsSeed,
  contractsSeed,
  coursesSeed,
  departmentsSeed,
  facultiesSeed,
  modalitiesSeed,
  monitorSizesSeed,
  monitorTypesSeed,
  pcTypesSeed,
  positionsSeed,
  postgraduatesSeed,
  rolesSeed,
  shiftsSeed,
  usersSeed,
} from './data';
import {
  audioEquipmentsSeed,
  buildingsSeed,
  connectivitiesSeed,
  roomTypesSeed,
} from './data/infraestructure.data';
import { MULTIMEDIA_TYPES } from '../src/modules/complementary-activities/enums';

const handleData = (array: { id: string; name: string }[]) =>
  Object.fromEntries(array.map((role) => [role.name, role.id]));

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const rolesData = handleData(rolesSeed);

  // Rangos
  const commonDatesAcademicPeriods: {
    pac: number;
    startDate: Date;
    endDate: Date;
    pac_modality?: string;
  }[] = [
    {
      pac: 1,
      startDate: new Date(2025, 0, 13), // 13 de enero
      endDate: new Date(2025, 4, 11), // 11 de mayo
    },
    {
      pac: 2,
      startDate: new Date(2025, 4, 12), // 12 de mayo
      endDate: new Date(2025, 7, 31), // 31 de agosto
    },
    {
      pac: 3,
      startDate: new Date(2025, 8, 1), // 1 de septiembre
      endDate: new Date(2025, 11, 20), // 20 de diciembre
    },
    {
      pac: 1,
      startDate: new Date(2025, 0, 10), // 10 de enero
      endDate: new Date(2025, 5, 25), // 25 de junio
      pac_modality: 'Semestre',
    },
    {
      pac: 2,
      startDate: new Date(2025, 6, 1), // 1 de julio
      endDate: new Date(2025, 11, 20), // 20 de diciembre
      pac_modality: 'Semestre',
    },
  ];

  const [
    roles,
    undergradDegrees,
    postgradDegrees,
    categories,
    contracts,
    shifts,
    positions,
    centers,
    faculties,
    brands,
    conditions,
    monitorTypes,
    monitorSizes,
    pcTypes,
    connectivities,
    roomTypes,
    audioEquipments,
    academicPeriods,
    modalities,
    activityTypes,
    multimediaTypes,
    commonDatesPeriods,
  ] = await Promise.all([
    prisma.role.createMany({
      data: rolesSeed,
      skipDuplicates: true,
    }),
    prisma.undergraduateDegree.createMany({
      data: careersSeed,
      skipDuplicates: true,
    }),
    prisma.postgraduateDegree.createMany({
      data: postgraduatesSeed,
      skipDuplicates: true,
    }),
    prisma.teacherCategory.createMany({
      data: categoriesSeed,
      skipDuplicates: true,
    }),
    prisma.contractType.createMany({
      data: contractsSeed,
      skipDuplicates: true,
    }),
    prisma.shift.createMany({
      data: shiftsSeed,
      skipDuplicates: true,
    }),
    prisma.position.createMany({
      data: positionsSeed,
      skipDuplicates: true,
    }),
    prisma.center.createMany({
      data: Object.values(centersSeed),
      skipDuplicates: true,
    }),
    prisma.faculty.createMany({
      data: Object.values(facultiesSeed),
      skipDuplicates: true,
    }),
    prisma.brand.createMany({
      data: Object.values(brandsSeed),
      skipDuplicates: true,
    }),
    prisma.condition.createMany({
      data: Object.values(conditionsSeed),
      skipDuplicates: true,
    }),
    prisma.monitorType.createMany({
      data: Object.values(monitorTypesSeed),
      skipDuplicates: true,
    }),
    prisma.monitorSize.createMany({
      data: Object.values(monitorSizesSeed),
      skipDuplicates: true,
    }),
    prisma.pcType.createMany({
      data: Object.values(pcTypesSeed),
      skipDuplicates: true,
    }),
    prisma.connectivity.createMany({
      data: Object.values(connectivitiesSeed),
      skipDuplicates: true,
    }),
    prisma.roomType.createMany({
      data: Object.values(roomTypesSeed),
      skipDuplicates: true,
    }),
    prisma.audioEquipment.createMany({
      data: Object.values(audioEquipmentsSeed),
      skipDuplicates: true,
    }),
    prisma.academicPeriod.createMany({
      data: academicPeriodsSeed,
      skipDuplicates: true,
    }),
    prisma.modality.createMany({
      data: modalitiesSeed,
      skipDuplicates: true,
    }),
    prisma.activityType.createMany({
      data: activityTypesSeed,
      skipDuplicates: true,
    }),
    prisma.multimediaType.createMany({
      data: Object.values(MULTIMEDIA_TYPES).map((mt) => ({
        description: mt,
      })),
      skipDuplicates: true,
    }),
    prisma.commonDatesAcademicPeriods.createMany({
      data: commonDatesAcademicPeriods,
      skipDuplicates: true,
    }),
  ]);

  // "Segunda" tanda
  const departments = await prisma.department.createMany({
    data: Object.values(departmentsSeed),
    skipDuplicates: true,
  });

  // "Tercera" tanda
  const [centerDepartments, courses, buildings] = await Promise.all([
    prisma.centerDepartment.createMany({
      data: centerDepartmentsSeed,
      skipDuplicates: true,
    }),
    prisma.course.createMany({
      data: Object.values(coursesSeed),
      skipDuplicates: true,
    }),
    prisma.building.createMany({
      data: buildingsSeed,
      skipDuplicates: true,
    }),
  ]);

  console.log({ roles });

  // Users
  let createdUser = 0;
  for (const user of usersSeed(rolesData)) {
    const passwordHash = await argon.hash(user.hash);

    await prisma.user.upsert({
      where: {
        email: user.email,
      },
      update: {},
      create: {
        name: user.name,
        email: user.email,
        code: user.code,
        hash: passwordHash,
        userRoles: {
          create: user.roleIds.map((id) => ({
            role: {
              connect: {
                id,
              },
            },
          })),
        },
      },
    });

    createdUser++;
  }

  console.log({ users: createdUser });

  // Pregrados
  console.log({ undergradDegrees });

  // Postgrados
  console.log({ postgradDegrees });

  // Categorias
  console.log({ categories });

  // Tipos de contratos
  console.log({ contracts });

  // Jornadas
  console.log({ shifts });

  // Cargos academicos
  console.log({ positions });

  // Centro
  console.log({ centers });

  // Facultades
  console.log({ faculties });

  // Departamentos
  console.log({ departments });

  // Centro => Departamentos
  console.log({ centerDepartments });

  // Clases/Asignaturas
  console.log({ courses });

  // Brands
  console.log({ brands });

  // Conditions
  console.log({ conditions });

  // Monitor Types
  console.log({ monitorTypes });

  // Monitor Sizes
  console.log({ monitorSizes });

  // PC Types
  console.log({ pcTypes });

  // Connectivities
  console.log({ connectivities });

  // RoomTypes
  console.log({ roomTypes });

  // AudioEquipments
  console.log({ audioEquipments });

  // Buildings
  console.log({ buildings });

  // Periodos Academicos
  console.log({ academicPeriods });

  // Modalidades
  console.log({ modalities });

  // Tipos de actividades complementarias
  console.log({ activityTypes });

  // Tipos de multimedia
  console.log({ multimediaTypes });

  // Fechas comunes de periodos academicos
  console.log({ commonDatesPeriods });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
