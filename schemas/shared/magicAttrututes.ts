import { z } from 'zod';

export const magicAttributesSchema = z.object({
  attack: z.number().default(0),
  defence: z.number().default(0),
});

export type MagicAttributes = z.infer<typeof magicAttributesSchema>;
