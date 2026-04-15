import { Request } from 'express';
import { TJwtPayload } from 'src/modules/auth/types';

export interface IReqWithUser extends Request {
  user: TJwtPayload;
}
