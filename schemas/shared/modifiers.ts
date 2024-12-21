import { z } from 'zod';

export const modifiersSchema = z.object({
  type: z.string(),
  chance: z.number().default(0),
  effect: z.number().default(0),
});

export type Modifiers = z.infer<typeof modifiersSchema>;
