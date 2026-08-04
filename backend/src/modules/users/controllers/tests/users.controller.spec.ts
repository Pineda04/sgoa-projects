import { ForbiddenException } from '@nestjs/common';
import { EUserRole } from 'src/common/enums';
import { UsersController } from '../users.controller';

describe('UsersController role boundaries', () => {
  const usersService = {
    createUserWithDeptAndPosition: jest.fn(),
  };
  const teachersService = {};
  const controller = new UsersController(
    usersService as never,
    teachersService as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    usersService.createUserWithDeptAndPosition.mockResolvedValue({
      id: 'user-1',
    });
  });

  it('only exposes arbitrary user updates to ADMIN', () => {
    // Metadata is attached to the route handler function by Nest's decorator.
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(Reflect.getMetadata('roles', controller.update)).toEqual([
      EUserRole.ADMIN,
    ]);
  });

  it('prevents RRHH from granting privileged roles', () => {
    expect(() =>
      controller.create(
        { roles: [EUserRole.DIRECCION] } as never,
        { sub: 'rrhh-1', roles: [EUserRole.RRHH] } as never,
      ),
    ).toThrow(ForbiddenException);
  });

  it('allows RRHH to create teachers and area coordinators', async () => {
    const dto = {
      roles: [EUserRole.DOCENTE, EUserRole.COORDINADOR_AREA],
    };
    const currentUser = { sub: 'rrhh-1', roles: [EUserRole.RRHH] };

    await controller.create(dto as never, currentUser as never);

    expect(usersService.createUserWithDeptAndPosition).toHaveBeenCalledWith(
      dto,
      currentUser,
    );
  });

  it('limits area coordinators to creating teachers', () => {
    expect(() =>
      controller.create(
        { roles: [EUserRole.MONITOR] } as never,
        {
          sub: 'coordinator-1',
          roles: [EUserRole.COORDINADOR_AREA],
        } as never,
      ),
    ).toThrow(ForbiddenException);
  });
});
