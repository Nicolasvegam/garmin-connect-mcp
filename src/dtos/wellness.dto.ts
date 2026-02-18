import { z } from 'zod';
import { dateString } from '../constants';

export type GetMenstrualCalendarDto = {
  startDate: string;
  endDate: string;
};

export const getMenstrualCalendarSchema = z.object({
  startDate: dateString.describe('Start date in YYYY-MM-DD format'),
  endDate: dateString.describe('End date in YYYY-MM-DD format'),
});
