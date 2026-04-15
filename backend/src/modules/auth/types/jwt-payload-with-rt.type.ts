import { TJwtPayload } from '.';

export type TJwtPayloadWithRt = TJwtPayload & { refreshToken: string };
