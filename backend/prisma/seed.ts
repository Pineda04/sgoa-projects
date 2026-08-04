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
  rolePermissionsSeed,
  permissionsSeed,
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

  // Idempotente: permite renombrar/promover roles existentes (ej. ADMIN -> SUPER_ADMIN)
  // sin perder las FKs ya creadas en user_roles.
  const roles = await Promise.all(
    rolesSeed.map((role) =>
      prisma.role.upsert({
        where: { id: role.id },
        update: {
          name: role.name,
          description: role.description,
          isSuperAdmin: role.isSuperAdmin ?? false,
        },
        create: {
          id: role.id,
          name: role.name,
          description: role.description,
          isSuperAdmin: role.isSuperAdmin ?? false,
        },
      }),
    ),
  );

  const [
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
  ] = await Promise.all([
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

  // Catálogo de permisos (Action x Subject)
  await prisma.permission.createMany({
    data: permissionsSeed,
    skipDuplicates: true,
  });

  const allPermissions = await prisma.permission.findMany();
  const permissionIdByKey = new Map(
    allPermissions.map((p) => [`${p.action}:${p.subject}`, p.id]),
  );

  const rolePermissionsRows = Object.entries(rolePermissionsSeed).flatMap(
    ([roleName, permissionKeys]) => {
      const roleId = rolesData[roleName];
      return permissionKeys
        .map((key) => permissionIdByKey.get(key))
        .filter((permissionId): permissionId is string => !!permissionId)
        .map((permissionId) => ({ roleId, permissionId }));
    },
  );

  const rolePermissions = await prisma.rolePermission.createMany({
    data: rolePermissionsRows,
    skipDuplicates: true,
  });

  console.log({ permissions: allPermissions.length, rolePermissions });

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
