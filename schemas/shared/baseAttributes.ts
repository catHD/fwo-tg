import { z } from 'zod';

export const baseAttributesSchema = z.object({
  hp: z.number().default(0),
  mp: z.number().default(0),
  en: z.number().default(0),
});

export type BaseAttributes = z.infer<typeof baseAttributesSchema>;
