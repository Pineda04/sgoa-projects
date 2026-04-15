import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { TUser } from '../types';
import { RolesService } from './roles.service';
import * as argon from 'argon2';
import { EUserRole } from 'src/common/enums';
import {
  generatePassword,
  hourToDateUTC,
  paginate,
  paginateOutput,
} from 'src/common/utils';
import { MailService } from 'src/modules/mail/services/mail.service';
import { TEMPLATE_TEMP_PASSWORD } from 'src/modules/mail/constants';
import { TJwtPayload } from 'src/modules/auth/types';
import { EPosition } from 'src/modules/teachers-config/enums';
import { PositionsService } from 'src/modules/teachers-config/services/positions.service';
import { QueryPaginationDto } from 'src/common/dto';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class UsersService {
  private readonly selectPropsUser = {
    id: true,
    name: true,
    code: true,
    email: true,
    activeStatus: true,
    // roleId: true,
    userRoles: {
      include: {
        role: true,
      },
    },
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly roleService: RolesService,
    private readonly mailService: MailService,
    @Inject(forwardRef(() => PositionsService))
    private readonly positionsService: PositionsService,
  ) {}

  async createUserWithDeptAndPosition(
    createUserDto: CreateUserDto,
    currentUser: TJwtPayload,
  ) {
    const { sub: userId, roles } = currentUser;

    // Verifica si el usuario no tiene ninguno de los roles DOCENTE o COORDINADOR_AREA, y en ese caso crea el usuario.
    if (
      createUserDto.roles.length !== 0 &&
      !createUserDto.roles.some((role) =>
        [EUserRole.DOCENTE, EUserRole.COORDINADOR_AREA].includes(role),
      )
    )
      return await this.create(createUserDto);

    // Ya existe el decorador... validacion extra
    if (roles.length === 1 && roles.includes(EUserRole.DOCENTE))
      throw new ForbiddenException(
        'Los docentes no pueden asignar un departamento.',
      );

    // TODO: Revisar esto
    // if (
    //   roles.includes(EUserRole.COORDINADOR_AREA) &&
    //   !roles.includes(EUserRole.ADMIN)
    // ) {
    //   const currentUserDepartment =
    //     await this.teacherDepartmentPositionService.findOneDepartmentHeadByUserId(
    //       userId,
    //     );
    //
    //   createUserDto.departmentId =
    //     currentUserDepartment.centerDepartment.departmentId;
    //   createUserDto.centerId = currentUserDepartment.centerDepartment.centerId;
    // }

    if (!createUserDto.centerDepartmentId)
      throw new BadRequestException(
        `Debe ingresar el departamento al que pertenerá el docente.`,
      );

    // Position
    const postionNone = await this.positionsService.findOneByName(
      EPosition.NONE,
    );

    if (roles.includes(EUserRole.DOCENTE) && createUserDto.positionId)
      throw new ForbiddenException('Los docentes no pueden asignar un cargo.');

    if (
      roles.includes(EUserRole.COORDINADOR_AREA) &&
      !roles.includes(EUserRole.ADMIN) &&
      createUserDto.positionId !== postionNone.id
    ) {
      createUserDto.positionId = postionNone.id;
    }

    if (!createUserDto.positionId)
      throw new BadRequestException(
        `Debe ingresar el cargo académico <positionId> que tendrá el docente en el departamento.`,
      );

    const coordinatorPosition = await this.positionsService.findOneByName(
      EPosition.DEPARTMENT_HEAD,
    );

    if (createUserDto.positionId === coordinatorPosition.id) {
      const existingCoordinator =
        await this.prisma.teacherDepartmentPosition.findFirst({
          where: {
            positionId: createUserDto.positionId,
            centerDepartmentId: createUserDto.centerDepartmentId,
            endDate: null,
          },
          select: { id: true, centerDepartmentId: true },
        });

      if (existingCoordinator)
        throw new BadRequestException(
          'El departamento ya cuenta con un usuario activo con cargo de Jefe/Coordinador. Debe finalizarlo antes de asignar uno nuevo.',
        );
    }

    return await this.create(createUserDto);
  }

  async create(createUserDto: CreateUserDto) {
    // Rol DOCENTE por defecto, no se coloca en el dto, ya que al actualizarlo...
    // ...toma el que este por defecto
    if (createUserDto.roles.length === 0)
      createUserDto.roles.push(EUserRole.DOCENTE);

    let isTempPass = false;

    // Se mandara por correo
    if (!createUserDto.password) {
      const tempPassword = generatePassword();

      createUserDto.password = tempPassword;
      createUserDto.passwordConfirm = tempPassword;

      isTempPass = true;
    }

    const {
      name,
      code,
      email,
      password,
      passwordConfirm,
      roles,
      categoryId,
      contractTypeId,
      shiftId,
      undergradId,
      postgradId,
      positionId,
      centerDepartmentId,
    } = createUserDto;

    if (passwordConfirm !== password)
      throw new BadRequestException(
        'La contraseña <password> y la contraseña de confirmación <passwordConfirm> deben coincidir.',
      );

    const hash = await argon.hash(password);

    const roleEntities = await Promise.all(
      roles.map((role) => this.roleService.findOneByName(role)),
    );

    const baseData = {
      name,
      code,
      email: email.toLowerCase(),
      hash,
      // roles: roleEntities.map((role) => role.id),
      userRoles: {
        create: roleEntities.map((role) => ({
          role: {
            connect: {
              id: role.id,
            },
          },
        })),
      },
    };

    const hasTeacherRole = roleEntities.some((role) =>
      [EUserRole.DOCENTE, EUserRole.COORDINADOR_AREA].includes(
        role.name as EUserRole,
      ),
    );

    // Crear aca toda la relacion, por si ocurre un problema...
    // ...al momento de crear el perfil de teacher, no sea en teachersService.
    const data = hasTeacherRole
      ? {
          ...baseData,
          teacher: {
            create: {
              category: { connect: { id: categoryId } },
              contractType: { connect: { id: contractTypeId } },
              shift: { connect: { id: shiftId } },
              undergradDegrees: {
                create: [
                  {
                    undergraduate: { connect: { id: undergradId } },
                  },
                ],
              },
              ...(postgradId
                ? {
                    undergradDegrees: {
                      create: [
                        {
                          undergraduate: { connect: { id: undergradId } },
                        },
                      ],
                    },
                  }
                : {}),
              ...(positionId && centerDepartmentId
                ? {
                    positionHeld: {
                      create: [
                        {
                          positionId,
                          centerDepartmentId,
                        },
                      ],
                    },
                  }
                : {}),
            },
          },
        }
      : baseData;

    const newUser = await this.prisma.user.create({
      data: {
        ...data,
      },
    });

    if (!newUser) throw new BadRequestException('Error al crear el usuario.');

    if (isTempPass)
      await this.mailService.sendMail({
        to: newUser.email!,
        subject: 'Contraseña temporal.',
        html: TEMPLATE_TEMP_PASSWORD(password),
      });

    return newUser;
  }

  async findAll(): Promise<TUser[]> {
    const users = await this.prisma.user.findMany({
      select: this.selectPropsUser,
    });

    // if (users.length === 0)
    //   throw new NotFoundException('No se encontraron datos.'); // tambien se puede devolver un 200 como consulta exitosa pero con data []

    return users;
  }

  async findOne(id: string): Promise<TUser> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        ...this.selectPropsUser,
        activeStatus: true,
      },
    });

    if (!user)
      throw new NotFoundException(
        `El usuario con id <${id}> no fue encontrado.`,
      );

    return user;
  }

  async findAllUsersWithRole(roleId: string): Promise<TUser[]> {
    await this.roleService.findOne(roleId);

    const users = await this.prisma.user.findMany({
      where: {
        userRoles: {
          some: {
            roleId,
          },
        },
      },
      select: this.selectPropsUser,
    });

    // if (users.length === 0)
    //   throw new NotFoundException('No se encontraron datos.'); // tambien se puede devolver un 200 como consulta exitosa pero con data []

    return users;
  }

  async findBySearchTerm(searchTerm: string = '', query: QueryPaginationDto) {
    const where: Prisma.UserWhereInput = {
      OR: [
        { code: { contains: searchTerm, mode: 'insensitive' } },
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
      ],
    };

    const [results, count] = await Promise.all([
      this.prisma.user.findMany({
        where,
        ...paginate(query),
        select: {
          id: true,
          email: true,
          code: true,
        },
      }),
      this.prisma.user.count({
        where,
      }),
    ]);

    return paginateOutput(results, count, query);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<TUser> {
    const {
      name,
      code,
      email,
      password,
      passwordConfirm,
      roles,
      activeStatus,
      ...teacher
    } = updateUserDto;

    const roleEntities =
      roles && roles.length
        ? await this.roleService.findManyByNames(roles)
        : [];

    const userData: Partial<Prisma.UserUpdateInput> = {
      name,
      code,
      email,
      activeStatus,
    };

    if (passwordConfirm !== password)
      throw new BadRequestException(
        'La contraseña <password> y la contraseña de confirmación <passwordConfirm> deben coincidir.',
      );

    if (password) userData.hash = await argon.hash(password);

    if (roleEntities.length) {
      userData.userRoles = {
        deleteMany: {},
        create: roleEntities.map((r) => ({
          role: {
            connect: {
              id: r.id,
            },
          },
        })),
      };
    }

    if (!Object.values(teacher).filter((el) => el).length)
      return await this.prisma.user.update({
        where: {
          id,
        },
        data: userData,
        select: this.selectPropsUser,
      });

    const teacherData: Prisma.TeacherUpdateInput = {
      category: teacher.categoryId
        ? { connect: { id: teacher.categoryId } }
        : undefined,
      contractType: teacher.contractTypeId
        ? { connect: { id: teacher.contractTypeId } }
        : undefined,
      shift: teacher.shiftId ? { connect: { id: teacher.shiftId } } : undefined,
      shiftStart: teacher.shiftStart
        ? hourToDateUTC(teacher.shiftStart)
        : undefined,
      shiftEnd: teacher.shiftEnd ? hourToDateUTC(teacher.shiftEnd) : undefined,
    };

    const [updatedUser, updatedTeacher] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id },
        data: userData,
        select: this.selectPropsUser,
      }),
      this.prisma.teacher.update({
        where: { userId: id },
        data: teacherData,
      }),
    ]);

    return updatedUser;
  }

  async remove(id: string): Promise<boolean> {
    const deleteUser = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        activeStatus: false,
      },
    });

    return !!deleteUser;
  }
}
