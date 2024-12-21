import { z } from 'zod';

export const magicSchema = z.object({
  name: z.string(),
  desc: z.string(),
  displayName: z.string(),
  cost: z.number(),
  effect: z.string().array(),
  lvl: z.number(),
});

export type Magic = z.infer<typeof magicSchema>;
