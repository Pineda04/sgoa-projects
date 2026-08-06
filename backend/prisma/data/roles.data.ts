import { ROLE_NAMES } from '../../src/common/constants';

export const rolesSeed = [
  {
    id: '74b067dc-1130-45f0-a66b-d95709f96502',
    name: ROLE_NAMES.SUPER_ADMIN,
    description:
      'Acceso total y protegido. Único rol que gestiona roles y permisos.',
    isSuperAdmin: true,
  },
  {
    id: '6705e39c-a5f1-46ab-97c0-d38eba358c73',
    name: ROLE_NAMES.DIRECCION,
    description: 'Personal de dirección.',
  },
  {
    id: 'ad710392-fcd0-4bf1-8259-fc6456509802',
    name: ROLE_NAMES.RRHH,
    description: 'Personal de recursos humanos.',
  },
  {
    id: 'c93114ba-9d47-476e-b7ed-b40b8d4d90d7',
    name: ROLE_NAMES.COORDINADOR_AREA,
    description: 'Docente que es coordinador de una carrera/área.',
  },
  {
    id: '64583707-7d7e-4fdc-8446-a4536cb855f0',
    name: ROLE_NAMES.DOCENTE,
    description: 'Todos los docentes, estos deben crear el perfil de docente.',
  },
  {
    id: '9b1e3c1a-2f6a-4b8d-9a3e-3a4c2f6e1a7d',
    name: ROLE_NAMES.MONITOR,
    description:
      'Personal encargado de verificar el cumplimiento de horarios en las aulas.',
  },
];
