import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';
import { LOOKUP_SOURCE_KEY } from '../decorators/lookup-source.decorator';
import {
  expandImpliedPermissions,
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
    expect(expandImpliedPermissions(['lookup:departments'])).toEqual([
      'lookup:departments',
    ]);
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

  it('mantiene el acceso total del super administrador', () => {
    const guard = buildGuard({
      permission: { action: 'delete', subject: 'faculties' },
    });

    expect(guard.canActivate(buildContext([], true))).toBe(true);
  });
});
