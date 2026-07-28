import path from 'node:path';

export const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), 'data');
export const GARMIN_TOKEN_DIR = path.join(DATA_DIR, 'garmin');
export const KAPSO_PLATFORM_API = process.env.KAPSO_PLATFORM_API ?? 'https://api.kapso.ai/platform/v1';
export const KAPSO_META_PROXY = process.env.KAPSO_META_PROXY ?? 'https://app.kapso.ai/api/meta';
