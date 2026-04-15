import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../constants';
import { TJwtPayload, TJwtPayloadWithRt } from '../types';

interface IRequestWithRT extends Request {
  signedCookies: {
    refresh_token: string;
  };
}

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        RtStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConstants.rtSecret,
      passReqToCallback: true,
    });
  }

  private static extractJWT(req: IRequestWithRT): string | null {
    if (
      (!req.signedCookies && !('refresh_token' in req.signedCookies)) ||
      (req.signedCookies.refresh_token &&
        req.signedCookies.refresh_token?.length === 0)
    )
      throw new ForbiddenException('Refresh token malformed!');

    return req.signedCookies.refresh_token;
  }

  validate(req: IRequestWithRT, payload: TJwtPayload): TJwtPayloadWithRt {
    const refreshToken =
      req.signedCookies.refresh_token ??
      req.get('authorization')?.replace('Bearer', '')?.trim();

    if (!refreshToken) throw new ForbiddenException('Refresh token malformed!');

    return {
      ...payload,
      refreshToken,
    };
  }
}
