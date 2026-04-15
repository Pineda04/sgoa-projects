import { TCloudinaryResource } from './resource.type';

export type TCloudinaryResponse = {
  resources: TCloudinaryResource[];
  rate_limit_allowed: number;
  rate_limit_reset_at: Date | string;
  rate_limit_remaining: number;
};
