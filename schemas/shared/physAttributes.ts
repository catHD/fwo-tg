import { z } from 'zod';

export const physAttributesSchema = z.object({
  attack: z.number().default(0),
  defence: z.number().default(0),
});

export type PhysAttributes = z.infer<typeof physAttributesSchema>;
