import { PERMISSION_KEY } from 'src/common/decorators/require-permission.decorator';
import { SUPER_ADMIN_ONLY_KEY } from 'src/common/decorators/super-admin-only.decorator';
import { UpdateMyUserDto } from '../../dto/update-my-user.dto';
import { UsersController } from '../users.controller';

describe('UsersController security boundaries', () => {
  const usersService = {
    normalizeRolesForCreate: jest.fn(),
    createUserWithDeptAndPosition: jest.fn(),
    update: jest.fn(),
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

  it.each([
    ['arbitrary user updates', 'update'],
    ['monitor-building reads', 'findMonitorBuildingAssignments'],
    ['monitor-building replacements', 'replaceMonitorBuildingAssignments'],
  ] as const)('restricts %s to super admins', (_label, handlerName) => {
    expect(
      Reflect.getMetadata(SUPER_ADMIN_ONLY_KEY, controller[handlerName]),
    ).toBe(true);
  });

  it('keeps self updates separate from the super-admin-only route', () => {
    expect(
      Reflect.getMetadata(SUPER_ADMIN_ONLY_KEY, controller['updateMy']),
    ).toBeUndefined();
    expect(
      Reflect.getMetadata(
        'design:paramtypes',
        UsersController.prototype,
        'updateMy',
      ),
    ).toEqual([String, UpdateMyUserDto]);

    const dto = {
      name: 'Updated name',
      email: 'updated@example.com',
      password: 'Password1',
      passwordConfirm: 'Password1',
    };

    void controller.updateMy('user-1', dto);

    expect(usersService.update).toHaveBeenCalledWith('user-1', dto);
  });

  it('normalizes creation roles through the dynamic role policy', async () => {
    const dto = { roles: ['CUSTOM_ROLE'] };
    const currentUser = {
      sub: 'creator-1',
      email: 'creator@example.com',
      roles: ['CUSTOM_CREATOR'],
      permissions: ['create:users'],
      isSuperAdmin: false,
    };
    usersService.normalizeRolesForCreate.mockReturnValue(['DOCENTE']);

    expect(Reflect.getMetadata(PERMISSION_KEY, controller['create'])).toEqual({
      action: 'create',
      subject: 'users',
    });

    await controller.create(dto as never, currentUser);

    expect(usersService.normalizeRolesForCreate).toHaveBeenCalledWith(
      ['CUSTOM_ROLE'],
      currentUser,
    );
    expect(usersService.createUserWithDeptAndPosition).toHaveBeenCalledWith(
      { roles: ['DOCENTE'] },
      currentUser,
    );
  });
});
