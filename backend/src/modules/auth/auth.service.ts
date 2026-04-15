import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { TTokens } from './types';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { AuthSigninDto } from './dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { nanoid } from 'nanoid';
import { MailService } from '../mail/services/mail.service';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  // async signupLocal(dto: AuthDto): Promise<TTokens> {
  //   const hash = await argon.hash(dto.password);
  //
  //   const existsUser = await this.prisma.user
  //     .findUnique({
  //       where: {
  //         email: dto.email,
  //       },
  //     })
  //     .catch((err) => console.log(err));
  //
  //   const newUser = await this.prisma.user
  //     .create({
  //       data: {
  //         email: dto.email,
  //         hash,
  //       },
  //     })
  //     .catch((err) => {
  //       if (err instanceof Prisma.PrismaClientKnownRequestError) {
  //         if (err.code === EPrismaClientErrors.UNIQUE.toString())
  //           throw new ForbiddenException('Credentials incorrect!');
  //       }
  //
  //       throw err;
  //     });
  //   // .catch((err) => console.log(err));
  //
  //
  //   if (!newUser) throw new BadRequestException('Error!');
  //
  //   const tokens = await this.getTokens(newUser.id, newUser.email);
  //   await this.updateRtHash(newUser.id, tokens.refresh_token);
  //
  //   return tokens;
  // }

  async signinLocal(dto: AuthSigninDto): Promise<TTokens> {
    const { code, email, password } = dto;

    if (!code && !email)
      throw new BadRequestException(
        'Debe ingresar el código de usuario o el email para poder iniciar sesión.',
      );

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: { contains: email, mode: 'insensitive' } }, { code }],
      },
      relationLoadStrategy: 'join',
      select: {
        id: true,
        email: true,
        code: true,
        hash: true,
        userRoles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
        activeStatus: true,
      },
    });

    if (!user || (user && !user.activeStatus))
      throw new ForbiddenException('¡Acceso denegado!');

    const passwordMatches = await argon.verify(user.hash, password);

    if (!passwordMatches) throw new ForbiddenException('¡Acceso denegado!');

    const tokens = await this.getTokens(
      user.id,
      user.email ?? user.code,
      user.userRoles.map((ur) => ur.role.name),
    );
    await this.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  }

  async logout(userId: string) {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        hashedRt: {
          not: null,
        },
      },
      data: {
        hashedRt: null,
      },
    });

    return;
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const { email } = dto;

    const existsUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!existsUser)
      throw new HttpException(
        'Si el usuario existe, pronto recibirá un correo.',
        HttpStatus.OK,
      );

    // Inactivar los tokens anteriores de este usuario
    await this.prisma.resetPasswordToken.updateMany({
      where: {
        userId: existsUser.id,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);

    const token = nanoid(128);

    await this.prisma.resetPasswordToken.create({
      data: {
        userId: existsUser.id,
        token,
        expiryDate,
      },
    });

    await this.mailService.sendResetPassword(existsUser.email!, token);

    // Por si se revisan las peticiones, no averiguar cual existe y cual no.
    throw new HttpException(
      'Si el usuario existe, pronto recibirá un correo.',
      HttpStatus.OK,
    );
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { token, password, passwordConfirm } = dto;

    const existsToken = await this.prisma.resetPasswordToken.findFirst({
      where: {
        token,
        expiryDate: { gte: new Date() },
        isActive: true,
      },
    });

    if (!existsToken)
      throw new BadRequestException(
        'El token de restablecimiento de contraseña no es válido o ha expirado.',
      );

    if (password !== passwordConfirm)
      throw new BadRequestException('Las contraseñas no coinciden.');

    const existsUser = await this.prisma.user.findUnique({
      where: {
        id: existsToken.userId,
      },
    });

    // por si se elimina en el proceso?
    if (!existsUser)
      throw new BadRequestException(
        'No se encontró un usuario asociado a este token.',
      );

    await this.prisma.resetPasswordToken.update({
      where: {
        token, // el token es "unique"
      },
      data: {
        isActive: false,
      },
    });

    return new HttpException(
      'La contraseña ha sido restablecida correctamente.',
      HttpStatus.OK,
    );
  }

  async refreshTokens(userId: string, rt: string): Promise<TTokens> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        code: true,
        hash: true,
        hashedRt: true,
        userRoles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.hashedRt)
      throw new ForbiddenException('¡Acceso denegado!');

    const rtMatches = await argon.verify(user.hashedRt, rt);

    if (!rtMatches) throw new ForbiddenException('¡Acceso denegado!');

    const tokens = await this.getTokens(
      user.id,
      user.email ?? user.code,
      user.userRoles.map((userRole) => userRole.role.name),
    );
    await this.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  }

  async updateRtHash(userId: string, rt: string): Promise<void> {
    const hash = await argon.hash(rt);

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRt: hash,
      },
    });
    // return;
  }

  // hashData(data: string) {
  //   return bcrypt.hash(data, 10);
  // }

  async getTokens(
    userId: string,
    email: string,
    roles: string[],
  ): Promise<TTokens> {
    const [at, rt] = await Promise.all([
      // access token
      this.jwtService.signAsync(
        { sub: userId, email, roles },
        { secret: jwtConstants.atSecret, expiresIn: 60 * 15 }, // 15 minutes => '15m'
      ),
      // refresh token
      this.jwtService.signAsync(
        { sub: userId },
        { secret: jwtConstants.rtSecret, expiresIn: 60 * 60 * 24 * 7 }, // 7 days => '7d'
      ),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }
}
