export const usersSeed = (rolesData: Record<string, string>) => [
  {
    name: 'user1',
    email: 'admin@me.com',
    code: '99999',
    hash: '12345',
    roleIds: [rolesData.SUPER_ADMIN],
  },
  {
    name: 'user2',
    email: 'direccion@me.com',
    code: '99998',
    hash: '12345',
    roleIds: [rolesData.DIRECCION],
  },
  {
    name: 'user3',
    email: 'rrhh@me.com',
    code: '99997',
    hash: '12345',
    roleIds: [rolesData.RRHH],
  },
  {
    name: 'user4',
    email: 'coordinator@me.com',
    code: '99996',
    hash: '12345',
    roleIds: [rolesData.COORDINADOR_AREA],
  },
  {
    name: 'user5',
    email: 'teacher@me.com',
    code: '99995',
    hash: '12345',
    roleIds: [rolesData.DOCENTE],
  },
];
