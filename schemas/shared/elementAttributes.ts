import { z } from 'zod';

export const elementAttributesSchema = z.object({
  fire: z.number().default(0),
  frost: z.number().default(0),
  acid: z.number().default(0),
  lightning: z.number().default(0),
});

export type ElementAttributes = z.infer<typeof elementAttributesSchema>;
