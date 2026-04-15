export type TCloudinaryResource = {
  asset_id: string;
  public_id: string;
  version: number;
  resource_type: 'image' | 'raw' | 'video';
  type: 'upload';
  created_at: string; // ISO date string
  bytes: number;
  folder: string;
  url: string;
  secure_url: string;
  format?: string;
  width?: number;
  height?: number;
};
