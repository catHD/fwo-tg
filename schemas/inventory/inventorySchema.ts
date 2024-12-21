import { z } from 'zod';

export const inventorySchema = z.object({
  code: z.string(),
  putOn: z.boolean(),
  wear: z.string(),
});

export type Inventory = z.infer<typeof inventorySchema>;
