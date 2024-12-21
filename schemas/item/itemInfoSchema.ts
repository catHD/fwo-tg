import { z } from 'zod';

export const itemInfoSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  case: z.string().optional(),
});

export type ItemInfo = z.infer<typeof itemInfoSchema>;
