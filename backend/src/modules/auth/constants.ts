import { envs } from 'src/config';

export const jwtConstants = {
  atSecret: envs.atSecret,
  rtSecret: envs.rtSecret,
};
