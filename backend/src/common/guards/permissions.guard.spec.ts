import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';
import { LOOKUP_SOURCE_KEY } from '../decorators/lookup-source.decorator';
import {
  expandImpliedPermissions,
  DEFAULT_PERMISSIONS,
  PERMISSION_SUBJECTS,
  TPermissionAction,
  TPermissionSubject,
} from '../constants';

type TEndpoint = {
  permission?: { action: TPermissionAction; subject: TPermissionSubject };
  isLookupSource?: boolean;
};

const buildContext = (permissions: string[], isSuperAdmin = false) =>
  ({
    getHandler: () => 'handler',
    getClass: () => 'class',
    switchToHttp: () => ({
      getRequest: () => ({ user: { permissions, isSuperAdmin } }),
    }),
  }) as unknown as ExecutionContext;

const buildGuard = ({ permission, isLookupSource }: TEndpoint) => {
  const reflector = {
    getAllAndOverride: (key: string) =>
      key === PERMISSION_KEY
        ? permission
        : key === LOOKUP_SOURCE_KEY
          ? isLookupSource
          : undefined,
  } as unknown as Reflector;

  return new PermissionsGuard(reflector);
};

describe('Permisos implícitos', () => {
  const departmentManager = expandImpliedPermissions(['manage:departments']);

  it('deriva lookup:faculties a partir de manage:departments', () => {
    expect(departmentManager).toEqual(
      expect.arrayContaining(['manage:departments', 'lookup:faculties']),
    );
  });

  it('no concede read:faculties, así que el módulo Facultades sigue oculto', () => {
    expect(departmentManager).not.toContain('read:faculties');

    const listadoDeFacultadesComoModulo = buildGuard({
      permission: { action: 'read', subject: 'faculties' },
    });

    expect(
      listadoDeFacultadesComoModulo.canActivate(
        buildContext(departmentManager),
      ),
    ).toBe(false);
  });

  it('permite leer el catálogo de facultades para llenar el selector', () => {
    const listadoMarcadoComoCatalogo = buildGuard({
      permission: { action: 'read', subject: 'faculties' },
      isLookupSource: true,
    });

    expect(
      listadoMarcadoComoCatalogo.canActivate(buildContext(departmentManager)),
    ).toBe(true);
  });

  it('no permite mutar facultades aunque el rol dependa de ellas', () => {
    const crearFacultad = buildGuard({
      permission: { action: 'create', subject: 'faculties' },
      isLookupSource: true,
    });

    expect(crearFacultad.canActivate(buildContext(departmentManager))).toBe(
      false,
    );
  });

  it('no filtra catálogos ajenos a las dependencias del rol', () => {
    const listadoDeCentros = buildGuard({
      permission: { action: 'read', subject: 'centers' },
      isLookupSource: true,
    });

    expect(listadoDeCentros.canActivate(buildContext(departmentManager))).toBe(
      false,
    );
  });

  it('expande de forma transitiva: manage:users trae sus propios catálogos', () => {
    expect(expandImpliedPermissions(['manage:users'])).toEqual(
      expect.arrayContaining([
        'manage:users',
        'lookup:centers',
        'lookup:positions',
        'lookup:periods',
        'lookup:degrees',
      ]),
    );
  });

  it('un lookup no arrastra nada: es lectura de catálogo, no acceso al módulo', () => {
    const expanded = expandImpliedPermissions(['lookup:departments']);

    // Solo el lookup pedido; lo demás son los permisos por defecto de todos.
    const byDefault: readonly string[] = DEFAULT_PERMISSIONS;
    expect(expanded.filter((p) => !byDefault.includes(p))).toEqual([
      'lookup:departments',
    ]);
    expect(expanded).not.toContain('lookup:faculties');
  });

  describe('dashboards: el permiso concede lo que hacen sus pestañas', () => {
    const authorities = expandImpliedPermissions([
      'manage:dashboard-authorities',
    ]);

    it.each([
      ['read', 'planifications'],
      ['read', 'reports'],
      ['read', 'users'],
      ['read', 'courses'],
      ['read', 'periods'],
      ['create', 'users'],
      ['delete', 'reports'],
    ] as [TPermissionAction, TPermissionSubject][])(
      'habilita %s:%s (pestañas del dashboard de autoridades)',
      (action, subject) => {
        const guard = buildGuard({ permission: { action, subject } });

        expect(guard.canActivate(buildContext(authorities))).toBe(true);
      },
    );

    it('trae el catálogo de departamentos del Consolidado sin abrir su módulo', () => {
      expect(authorities).toContain('lookup:departments');
      expect(authorities).not.toContain('read:departments');
    });

    it('no se desborda a módulos ajenos al dashboard', () => {
      const guard = buildGuard({
        permission: { action: 'read', subject: 'pc-equipments' },
      });

      expect(guard.canActivate(buildContext(authorities))).toBe(false);
    });

    it('el dashboard docente no concede gestión de informes ajenos', () => {
      const teacher = expandImpliedPermissions(['manage:dashboard-teacher']);

      expect(teacher).toContain('read:reports');
      expect(teacher).not.toContain('manage:reports');

      const borrarInforme = buildGuard({
        permission: { action: 'delete', subject: 'reports' },
      });

      expect(borrarInforme.canActivate(buildContext(teacher))).toBe(false);
    });
  });

  describe('módulos incorporados desde main', () => {
    it('el dashboard de monitoreo habilita registrar y consultar verificaciones', () => {
      const monitor = expandImpliedPermissions(['manage:dashboard-monitor']);

      for (const [action, subject] of [
        ['create', 'schedule-compliance-check'],
        ['read', 'schedule-compliance-check'],
        ['read', 'reports-monitor'],
      ] as [TPermissionAction, TPermissionSubject][]) {
        const guard = buildGuard({ permission: { action, subject } });

        expect(guard.canActivate(buildContext(monitor))).toBe(true);
      }

      // Recorre aulas y edificios, pero no administra esos módulos.
      expect(monitor).toContain('lookup:classrooms');
      expect(monitor).not.toContain('read:classrooms');
    });

    it('el monitor edita y sincroniza sus verificaciones offline', () => {
      const monitor = expandImpliedPermissions(['manage:dashboard-monitor']);

      // PATCH /monitor/checks/:id y POST /monitor/checks/batch-sync
      const editar = buildGuard({
        permission: { action: 'update', subject: 'schedule-compliance-check' },
      });
      const sincronizar = buildGuard({
        permission: { action: 'create', subject: 'schedule-compliance-check' },
      });

      expect(editar.canActivate(buildContext(monitor))).toBe(true);
      expect(sincronizar.canActivate(buildContext(monitor))).toBe(true);
    });

    it('la ficha de aula lista las computadoras del aula sin abrir inventario', () => {
      const teacher = expandImpliedPermissions(['manage:dashboard-teacher']);

      const equiposDelAula = buildGuard({
        permission: { action: 'read', subject: 'pc-equipments' },
        isLookupSource: true,
      });
      const editarEquipo = buildGuard({
        permission: { action: 'update', subject: 'pc-equipments' },
      });

      expect(equiposDelAula.canActivate(buildContext(teacher))).toBe(true);
      expect(editarEquipo.canActivate(buildContext(teacher))).toBe(false);
    });

    it('la plantilla de planificación queda para quien puede crearlas', () => {
      const coordinator = expandImpliedPermissions([
        'manage:dashboard-coordinator',
      ]);
      const teacher = expandImpliedPermissions(['manage:dashboard-teacher']);

      const plantilla = buildGuard({
        permission: { action: 'create', subject: 'planifications' },
      });

      expect(plantilla.canActivate(buildContext(coordinator))).toBe(true);
      expect(plantilla.canActivate(buildContext(teacher))).toBe(false);
    });

    it('el coordinador consulta next-to-create aunque solo tenga lookup:periods', () => {
      const coordinator = expandImpliedPermissions([
        'manage:dashboard-coordinator',
      ]);

      expect(coordinator).toContain('lookup:periods');

      const nextToCreate = buildGuard({
        permission: { action: 'read', subject: 'periods' },
        isLookupSource: true,
      });
      const periodosComoModulo = buildGuard({
        permission: { action: 'read', subject: 'periods' },
      });

      expect(nextToCreate.canActivate(buildContext(coordinator))).toBe(true);
      expect(periodosComoModulo.canActivate(buildContext(coordinator))).toBe(
        false,
      );
    });

    it('el docente abre la ficha de aula sin quedarse con el módulo Aulas', () => {
      const teacher = expandImpliedPermissions(['manage:dashboard-teacher']);

      // Abre la ruta protegida de la ficha...
      expect(teacher).toContain('read:dashboard-tab-classrooms');
      // ...y llega a los datos que la ficha muestra...
      expect(teacher).toEqual(
        expect.arrayContaining([
          'lookup:classrooms',
          'lookup:pc-equipments',
          'lookup:air-conditioners',
          'lookup:digital-blackboards',
        ]),
      );
      // ...pero el módulo Aulas sigue fuera del menú y del mantenimiento.
      expect(teacher).not.toContain('read:classrooms');

      const fichaDeAula = buildGuard({
        permission: { action: 'read', subject: 'classrooms' },
        isLookupSource: true,
      });
      const editarAula = buildGuard({
        permission: { action: 'update', subject: 'classrooms' },
      });

      expect(fichaDeAula.canActivate(buildContext(teacher))).toBe(true);
      expect(editarAula.canActivate(buildContext(teacher))).toBe(false);
    });

    it('la página Catálogo concede las entidades que administra', () => {
      const catalog = expandImpliedPermissions(['manage:catalog']);

      expect(catalog).toEqual(
        expect.arrayContaining([
          'manage:brands',
          'manage:conditions',
          'manage:room-types',
          'manage:shifts',
          'manage:contract-types',
          'manage:teacher-categories',
        ]),
      );
    });

    it('el formulario de aula alcanza sus catálogos sin abrirles el módulo', () => {
      const classroomManager = expandImpliedPermissions(['manage:classrooms']);

      for (const subject of [
        'conditions',
        'connectivities',
        'room-types',
        'digital-blackboards',
      ] as TPermissionSubject[]) {
        expect(classroomManager).toContain(`lookup:${subject}`);

        const listado = buildGuard({
          permission: { action: 'read', subject },
          isLookupSource: true,
        });
        const alta = buildGuard({
          permission: { action: 'create', subject },
        });

        expect(listado.canActivate(buildContext(classroomManager))).toBe(true);
        expect(alta.canActivate(buildContext(classroomManager))).toBe(false);
      }
    });
  });

  describe('inicio, ayuda y perfil: implícitos para todos', () => {
    it('los recibe cualquier usuario, incluso uno sin permisos asignados', () => {
      expect(expandImpliedPermissions([])).toEqual(
        expect.arrayContaining([
          'manage:home',
          'manage:help',
          'manage:profile',
        ]),
      );
    });

    it('no son asignables: quedan fuera del catálogo de la matriz', () => {
      for (const subject of ['home', 'help', 'profile'])
        expect(PERMISSION_SUBJECTS).not.toContain(subject);
    });
  });

  it('mantiene el acceso total del super administrador', () => {
    const guard = buildGuard({
      permission: { action: 'delete', subject: 'faculties' },
    });

    expect(guard.canActivate(buildContext([], true))).toBe(true);
  });
});
