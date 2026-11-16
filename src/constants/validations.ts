import { z } from 'zod';

export const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format');

export const paceString = z
  .string()
  .regex(/^0?([1-9]|[1-5]\d):[0-5]\d$/, 'Must be m:ss per km between 1:00 and 59:59, e.g. 5:30');
