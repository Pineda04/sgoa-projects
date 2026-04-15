export const usersSeed = (rolesData: Record<string, string>) => [
  {
    name: 'user1',
    email: 'admin1@gmail.com',
    code: '99999',
    hash: '12345',
    roleIds: [rolesData.ADMIN, rolesData.COORDINADOR_AREA],
  },
  {
    name: 'user2',
    email: 'teacher1@gmail.com',
    code: '99998',
    hash: '12345',
    roleIds: [rolesData.DOCENTE],
  },
  {
    name: 'user3',
    email: 'rrhh1@gmail.com',
    code: '99997',
    hash: '12345',
    roleIds: [rolesData.RRHH],
  },
  {
    name: 'user4',
    email: 'rrhh2@gmail.com',
    code: '99996',
    hash: 'Temporal.12345',
    roleIds: [rolesData.RRHH],
  },
  {
    name: 'user2',
    email: 'teacher1@gmail.com',
    code: '99995',
    hash: '12345',
    roleIds: [rolesData.DOCENTE],
  },
  {
    name: 'coordinator',
    email: 'coordinator@gmail.com',
    code: '99994',
    hash: '12345',
    roleIds: [rolesData.COORDINADOR_AREA, rolesData.DOCENTE],
  },
];
