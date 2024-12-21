import { z } from 'zod';

export const orderSchema = z.object({
  target: z.string(),
  action: z.string(),
  proc: z.number(),
});

export type Order = z.infer<typeof orderSchema>;
