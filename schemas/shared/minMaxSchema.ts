import { z } from 'zod';

export const minMaxSchema = z.object({
  min: z.number().int().default(0),
  max: z.number().int().default(0),
});

export type MinMax = z.infer<typeof minMaxSchema>;
